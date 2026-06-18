"""
Mentoria Hub - AI service (FastAPI).

Pass 1 — video → notes:  Gemini (only model that reads YouTube URLs).
Pass 2 — notes → quiz:   OpenAI (fast, cheap text generation).

Env vars (set in Railway dashboard):
  GEMINI_API_KEY   — required for Pass 1
  OPENAI_API_KEY   — required for Pass 2
  GEMINI_MODEL     — default: gemini-2.5-flash
  QUIZ_MODEL       — default: gpt-4o-mini
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

try:
    from openai import OpenAI as _OpenAI
except ImportError:
    _OpenAI = None

app = FastAPI(title="Mentoria Hub AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_MODEL   = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
QUIZ_MODEL     = os.getenv("QUIZ_MODEL",   "gpt-4o-mini")


class GenerateRequest(BaseModel):
    youtube_url: str
    num_questions: int = 10


# ── Gemini (Pass 1 only) ──────────────────────────────────────────────────────

def _gemini_client():
    if genai is None:
        raise HTTPException(500, "google-genai not installed")
    if not GEMINI_API_KEY:
        raise HTTPException(500, "GEMINI_API_KEY not set in environment")
    return genai.Client(api_key=GEMINI_API_KEY)


def _retry_delay(exc) -> float:
    """Parse Gemini 429 retryDelay hint, fall back to safe default."""
    try:
        body = exc.args[0] if exc.args else {}
        if isinstance(body, dict):
            for detail in body.get("error", {}).get("details", []):
                rd = detail.get("retryDelay", "")
                if rd:
                    return float(rd.rstrip("s")) + 2
    except Exception:
        pass
    return 45.0


def _gemini_call(client, contents, retries=3):
    for attempt in range(retries):
        try:
            resp = client.models.generate_content(model=GEMINI_MODEL, contents=contents)
            return resp.text
        except Exception as e:
            logger.error("Gemini attempt %d/%d failed: %s", attempt + 1, retries, e)
            if attempt == retries - 1:
                raise HTTPException(502, f"Gemini call failed: {e}")
            wait = _retry_delay(e)
            logger.info("Waiting %.0fs before retry…", wait)
            time.sleep(wait)


def _make_video_contents(prompt: str, youtube_url: str):
    video_part = genai_types.Part(
        file_data=genai_types.FileData(file_uri=youtube_url, mime_type="video/*")
    )
    return [genai_types.Content(parts=[genai_types.Part(text=prompt), video_part])]


# ── OpenAI (Pass 2 only) ──────────────────────────────────────────────────────

def _openai_client():
    if _OpenAI is None:
        raise HTTPException(500, "openai package not installed")
    if not OPENAI_API_KEY:
        raise HTTPException(500, "OPENAI_API_KEY not set in environment")
    return _OpenAI(api_key=OPENAI_API_KEY)


def _openai_call(client, prompt: str) -> str:
    resp = client.chat.completions.create(
        model=QUIZ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    return resp.choices[0].message.content


# ── Shared util ───────────────────────────────────────────────────────────────

def _strip_json(text: str):
    text = text.strip()
    for prefix in ("```json", "```"):
        if text.startswith(prefix):
            text = text[len(prefix):]
    if text.endswith("```"):
        text = text[:-3]
    return json.loads(text.strip())


logger.info(
    "AI service starting. gemini_model=%s quiz_model=%s gemini_key=%s openai_key=%s",
    GEMINI_MODEL, QUIZ_MODEL, bool(GEMINI_API_KEY), bool(OPENAI_API_KEY),
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status":            "ok",
        "gemini_model":      GEMINI_MODEL,
        "quiz_model":        QUIZ_MODEL,
        "gemini_key_loaded": bool(GEMINI_API_KEY),
        "openai_key_loaded": bool(OPENAI_API_KEY),
    }


@app.post("/generate-lesson")
def generate_lesson(req: GenerateRequest):
    gemini = _gemini_client()
    openai = _openai_client()

    # ── Pass 1: Gemini reads the YouTube video → structured notes ────────────
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
    notes_raw = _gemini_call(gemini, _make_video_contents(pass1_prompt, req.youtube_url))
    notes = _strip_json(notes_raw)
    logger.info("Pass 1 complete. title=%s", notes.get("title"))

    # ── Pass 2: OpenAI reads the notes → quiz bank ───────────────────────────
    quiz: list = []
    notes_text = json.dumps(notes)
    batch_size  = 5

    while len(quiz) < req.num_questions:
        remaining     = min(batch_size, req.num_questions - len(quiz))
        already_asked = json.dumps([q["question"] for q in quiz])
        quiz_prompt = (
            f"From these lesson notes, write exactly {remaining} multiple-choice quiz questions. "
            "Use ONLY facts stated in the notes — do not invent anything. "
            "Return a JSON object with a single key 'questions' containing an array. "
            "Each element must have: question (string), options (array of exactly 4 strings), "
            "correct_index (integer 0-3), explanation (string). "
            f"Do NOT repeat: {already_asked}. "
            f"Lesson notes: {notes_text}"
        )
        try:
            chunk_raw = _openai_call(openai, quiz_prompt)
            parsed    = _strip_json(chunk_raw)
            # OpenAI json_object mode requires a top-level key — unwrap it
            chunk = parsed.get("questions", parsed) if isinstance(parsed, dict) else parsed
            if not isinstance(chunk, list) or not chunk:
                logger.warning("Quiz batch empty — stopping early")
                break
            quiz.extend(chunk)
            logger.info("Quiz: %d/%d questions", len(quiz), req.num_questions)
        except Exception as e:
            logger.warning("Quiz generation stopped early: %s", e)
            break

    logger.info("Done. quiz_count=%d", len(quiz))
    return {"notes": notes, "quiz": quiz[: req.num_questions], "quiz_count": len(quiz)}
