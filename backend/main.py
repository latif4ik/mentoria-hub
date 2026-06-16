"""
Mentoria Hub - AI service (FastAPI).
Only job: take a YouTube URL, call Gemini, return lesson notes + a quiz bank.
Everything else (courses, opportunities, users, saved items) lives in Supabase
and is called directly from the React frontend.
"""
import os
import json
import time
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from google import genai
    from google.genai import types as genai_types
except ImportError:
    genai = None
    genai_types = None

app = FastAPI(title="Mentoria Hub AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL = "gemini-2.0-flash"


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
            logger.error("Gemini attempt %d/%d failed: %s", attempt + 1, retries, e)
            if attempt == retries - 1:
                raise HTTPException(502, f"Gemini call failed: {e}")
            time.sleep(2 ** attempt)


def _strip_json(text: str):
    """Models often wrap JSON in ```json fences. Strip before parsing."""
    text = text.strip()
    # Remove common fence patterns
    for prefix in ("```json", "```"):
        if text.startswith(prefix):
            text = text[len(prefix):]
    if text.endswith("```"):
        text = text[:-3]
    return json.loads(text.strip())


def _make_video_contents(prompt: str, youtube_url: str):
    """Build multimodal contents list with a YouTube video part."""
    video_part = genai_types.Part(
        file_data=genai_types.FileData(
            file_uri=youtube_url,
            mime_type="video/*",
        )
    )
    text_part = genai_types.Part(text=prompt)
    return [genai_types.Content(parts=[text_part, video_part])]


logger.info("Mentoria Hub AI service starting. Gemini key loaded: %s", bool(GEMINI_API_KEY))


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

    # ── Pass 1: video → notes (the only call that touches the video) ──────────
    pass1_prompt = (
        "You are an educational content designer. Watch this lesson video and "
        "produce a JSON object with exactly these keys: "
        "'title' (short descriptive title, string), "
        "'summary' (5–8 sentence overview for students, string), "
        "'key_points' (array of concise factual bullet strings), "
        "'outline' (array of {timestamp:'MM:SS', topic:string}). "
        "Only use information actually present in the video. "
        "Return ONLY valid JSON, no extra text."
    )
    notes_raw = _call_with_retry(client, _make_video_contents(pass1_prompt, req.youtube_url))
    notes = _strip_json(notes_raw)

    # ── Pass 2: notes → quiz bank, in batches of 10 (text-only, no video) ─────
    quiz: list = []
    notes_text = json.dumps(notes)
    batch_size  = 10

    while len(quiz) < req.num_questions:
        remaining = min(batch_size, req.num_questions - len(quiz))
        already_asked = json.dumps([q["question"] for q in quiz])
        quiz_prompt = (
            f"From these lesson notes, write exactly {remaining} multiple-choice quiz questions. "
            "Use ONLY facts stated in the notes — do not invent anything. "
            "Each item must be a JSON object with keys: "
            "question (string), options (array of 4 strings), "
            "correct_index (int 0–3), explanation (string). "
            f"Do NOT repeat these already-generated questions: {already_asked}. "
            f"Notes: {notes_text}. "
            "Return ONLY a valid JSON array of objects, no extra text."
        )
        try:
            chunk_raw = _call_with_retry(client, [quiz_prompt])
            chunk = _strip_json(chunk_raw)
            if not isinstance(chunk, list) or not chunk:
                break
            quiz.extend(chunk)
        except Exception:
            break  # stop gracefully rather than crash mid-generation

    return {"notes": notes, "quiz": quiz[: req.num_questions]}
