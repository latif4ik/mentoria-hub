"""
Mentoria Hub - AI service (FastAPI).
Only job: take a YouTube URL, call Gemini, return lesson notes + a quiz bank.
Everything else (courses, opportunities, users, saved items) lives in Supabase
and is called directly from the React frontend.
"""
import os
import json
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# google-genai SDK; key is read from env, NEVER from the browser
try:
    from google import genai
except ImportError:
    genai = None

app = FastAPI(title="Mentoria Hub AI Service")

# Allow the React dev server to call this during the hackathon.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten before any real deployment
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL = "gemini-2.5-flash"  # free-tier workhorse; swap if Google renames it


class GenerateRequest(BaseModel):
    youtube_url: str
    num_questions: int = 50


def _client():
    if genai is None:
        raise HTTPException(500, "google-genai not installed")
    if not GEMINI_API_KEY:
        raise HTTPException(500, "GEMINI_API_KEY not set in environment")
    return genai.Client(api_key=GEMINI_API_KEY)


def _call_with_retry(client, contents, retries=3):
    """Free tier returns 429 under bursts; retry with backoff."""
    for attempt in range(retries):
        try:
            resp = client.models.generate_content(model=MODEL, contents=contents)
            return resp.text
        except Exception as e:
            if attempt == retries - 1:
                raise HTTPException(502, f"Gemini call failed: {e}")
            time.sleep(2 ** attempt)


def _strip_json(text: str):
    """Models often wrap JSON in ```json fences. Clean before parsing."""
    text = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```")
    return json.loads(text)


@app.get("/health")
def health():
    return {"status": "ok", "gemini_key_loaded": bool(GEMINI_API_KEY)}


@app.post("/generate-lesson")
def generate_lesson(req: GenerateRequest):
    """
    Pass 1: video -> structured notes + summary (processes the video ONCE).
    Pass 2: notes -> quiz bank in batches of 10 (cheap, text-only).
    """
    client = _client()

    # ---- Pass 1: video -> notes (the only call that processes the video) ----
    pass1_prompt = (
        "You are an educational content designer. Watch this lesson video and "
        "produce a JSON object with: 'title' (short), 'summary' (5-8 sentences), "
        "'key_points' (array of concise factual bullet strings), and "
        "'outline' (array of {timestamp:'MM:SS', topic:string}). "
        "Only use information actually present in the video. Return ONLY JSON."
    )
    notes_raw = _call_with_retry(
        client,
        [pass1_prompt, {"file_data": {"file_uri": req.youtube_url}}],
    )
    notes = _strip_json(notes_raw)

    # ---- Pass 2: notes -> quiz bank, batched by 10 (no video reprocessing) ----
    quiz = []
    batch = 10
    notes_text = json.dumps(notes)
    while len(quiz) < req.num_questions:
        remaining = min(batch, req.num_questions - len(quiz))
        quiz_prompt = (
            f"From these lesson notes, write {remaining} multiple-choice quiz "
            "questions. Use ONLY facts in the notes; do not invent anything. "
            "Each item: {question, options:[4 strings], correct_index:int, "
            "explanation:string}. Avoid repeating earlier questions. "
            f"Already asked: {json.dumps([q['question'] for q in quiz])}. "
            f"Notes: {notes_text}. Return ONLY a JSON array."
        )
        try:
            chunk = _strip_json(_call_with_retry(client, [quiz_prompt]))
            if not chunk:
                break
            quiz.extend(chunk)
        except Exception:
            break  # stop gracefully rather than crash mid-generation

    return {"notes": notes, "quiz": quiz[: req.num_questions]}
