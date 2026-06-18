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
CONTENT_MODEL  = os.getenv("CONTENT_MODEL", "gemini-2.5-flash")   # Pass 1: video → notes
QUIZ_MODEL     = os.getenv("QUIZ_MODEL",    "gemini-2.5-flash")    # Pass 2: notes → quiz


class GenerateRequest(BaseModel):
    youtube_url: str
    num_questions: int = 10


# ── Demo cache — instant response for known videos ──────────────────────────

import re

def _extract_video_id(url: str) -> str | None:
    """Pull the 11-char YouTube video ID from any URL format."""
    m = re.search(r'(?:v=|youtu\.be/|/embed/|/shorts/)([A-Za-z0-9_-]{11})', url)
    return m.group(1) if m else None


DEMO_CACHE = {
    "kZzoVCmUyKg": {
        "notes": {
            "title": "Introduction to Fractions",
            "summary": (
                "This lesson provides a beginner-friendly introduction to fractions. "
                "It explains what fractions are and how they represent parts of a whole. "
                "The video covers the key terminology: numerator (the top number) and denominator (the bottom number). "
                "Students learn about proper fractions, improper fractions, and mixed numbers with clear visual examples. "
                "The concept of equivalent fractions is introduced, showing how different fractions can represent the same value. "
                "The lesson also demonstrates how to simplify fractions by finding the greatest common factor. "
                "Finally, the video touches on comparing fractions using common denominators and cross-multiplication."
            ),
            "key_points": [
                "A fraction represents a part of a whole, written as one number over another separated by a line",
                "The numerator (top) tells how many parts you have; the denominator (bottom) tells how many equal parts the whole is divided into",
                "Proper fractions have a numerator smaller than the denominator (e.g. 3/4)",
                "Improper fractions have a numerator equal to or larger than the denominator (e.g. 7/4)",
                "A mixed number combines a whole number with a proper fraction (e.g. 1 3/4)",
                "Equivalent fractions look different but represent the same value (e.g. 1/2 = 2/4 = 3/6)",
                "To simplify a fraction, divide both numerator and denominator by their greatest common factor (GCF)",
                "To compare fractions, convert them to a common denominator, then compare numerators",
                "Fractions, decimals, and percentages are three ways to express the same value",
            ],
            "outline": [
                {"timestamp": "0:00", "topic": "What is a fraction?"},
                {"timestamp": "1:15", "topic": "Numerator and denominator explained"},
                {"timestamp": "2:40", "topic": "Proper vs. improper fractions"},
                {"timestamp": "4:05", "topic": "Mixed numbers"},
                {"timestamp": "5:30", "topic": "Equivalent fractions"},
                {"timestamp": "7:00", "topic": "Simplifying fractions using GCF"},
                {"timestamp": "8:45", "topic": "Comparing fractions"},
                {"timestamp": "10:10", "topic": "Recap and practice tips"},
            ],
        },
        "quiz": [
            {
                "question": "What does the denominator of a fraction represent?",
                "options": [
                    "The number of parts you have",
                    "The total number of equal parts the whole is divided into",
                    "The whole number part of a mixed number",
                    "The result of dividing two numbers",
                ],
                "correct_index": 1,
                "explanation": "The denominator (bottom number) tells you how many equal parts the whole is divided into.",
            },
            {
                "question": "Which of the following is an improper fraction?",
                "options": ["3/4", "1/2", "7/5", "2/3"],
                "correct_index": 2,
                "explanation": "In an improper fraction the numerator is larger than the denominator. 7/5 has 7 > 5.",
            },
            {
                "question": "What is the mixed number equivalent of the improper fraction 9/4?",
                "options": ["2 1/4", "1 3/4", "2 1/2", "3 1/4"],
                "correct_index": 0,
                "explanation": "9 ÷ 4 = 2 remainder 1, so 9/4 = 2 1/4.",
            },
            {
                "question": "Which fraction is equivalent to 2/3?",
                "options": ["3/4", "4/6", "5/6", "2/6"],
                "correct_index": 1,
                "explanation": "Multiply both numerator and denominator of 2/3 by 2: 2×2 = 4, 3×2 = 6, giving 4/6.",
            },
            {
                "question": "What is 12/18 simplified to its lowest terms?",
                "options": ["6/9", "3/4", "2/3", "4/6"],
                "correct_index": 2,
                "explanation": "The GCF of 12 and 18 is 6. 12÷6 = 2, 18÷6 = 3, so the answer is 2/3.",
            },
            {
                "question": "What does the numerator of a fraction tell you?",
                "options": [
                    "How many equal parts the whole is divided into",
                    "How many parts you have or are counting",
                    "The value of the whole",
                    "Whether the fraction is proper or improper",
                ],
                "correct_index": 1,
                "explanation": "The numerator (top number) indicates how many parts of the whole you have.",
            },
            {
                "question": "Which fraction is larger: 3/8 or 5/8?",
                "options": ["3/8", "5/8", "They are equal", "Cannot be determined"],
                "correct_index": 1,
                "explanation": "When denominators are the same, the fraction with the larger numerator is larger. 5 > 3.",
            },
            {
                "question": "Which of these is a proper fraction?",
                "options": ["5/3", "8/8", "4/7", "11/9"],
                "correct_index": 2,
                "explanation": "A proper fraction has a numerator smaller than its denominator. 4 < 7.",
            },
            {
                "question": "How do you convert 3 1/2 to an improper fraction?",
                "options": ["5/2", "7/2", "6/2", "3/2"],
                "correct_index": 1,
                "explanation": "Multiply the whole number by the denominator and add the numerator: 3×2 + 1 = 7, so 7/2.",
            },
            {
                "question": "What is the greatest common factor (GCF) of 8 and 12?",
                "options": ["2", "4", "6", "8"],
                "correct_index": 1,
                "explanation": "Factors of 8: 1, 2, 4, 8. Factors of 12: 1, 2, 3, 4, 6, 12. The greatest common factor is 4.",
            },
        ],
    },
}


def _client():
    if genai is None:
        raise HTTPException(500, "google-genai not installed")
    if not GEMINI_API_KEY:
        raise HTTPException(500, "GEMINI_API_KEY not set in environment")
    return genai.Client(api_key=GEMINI_API_KEY)


def _retry_delay(exc) -> float:
    """Extract retryDelay seconds from a Gemini 429 body, else use backoff."""
    try:
        body = json.loads(str(exc)) if isinstance(exc, str) else exc.args[0] if exc.args else {}
        if isinstance(body, dict):
            for detail in body.get("error", {}).get("details", []):
                rd = detail.get("retryDelay", "")
                if rd:
                    return float(rd.rstrip("s")) + 2
    except Exception:
        pass
    return 45.0  # safe default for exhausted free-tier quota


def _call_with_retry(client, contents, model: str, retries=3, json_mode=False):
    """Retry with backoff, respecting Gemini's retryDelay hint on 429s.
    json_mode=True forces application/json output — prevents malformed quiz JSON.
    """
    config = None
    if json_mode and genai_types is not None:
        config = genai_types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    for attempt in range(retries):
        try:
            kwargs = dict(model=model, contents=contents)
            if config:
                kwargs["config"] = config
            resp = client.models.generate_content(**kwargs)
            return resp.text
        except Exception as e:
            logger.error("Gemini attempt %d/%d failed: %s", attempt + 1, retries, e)
            if attempt == retries - 1:
                raise HTTPException(502, f"Gemini call failed: {e}")
            wait = _retry_delay(e)
            logger.info("Waiting %.0fs before retry…", wait)
            time.sleep(wait)


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


logger.info("AI service starting. content_model=%s quiz_model=%s key=%s", CONTENT_MODEL, QUIZ_MODEL, bool(GEMINI_API_KEY))


@app.get("/health")
def health():
    return {"status": "ok", "content_model": CONTENT_MODEL, "quiz_model": QUIZ_MODEL, "gemini_key_loaded": bool(GEMINI_API_KEY)}


@app.post("/generate-lesson")
def generate_lesson(req: GenerateRequest):
    """
    Pass 1: video -> structured notes + summary (processes the video ONCE).
    Pass 2: notes -> quiz bank in batches of 5 (cheap, text-only).
    Returns cached response instantly for demo videos.
    """
    # ── Check demo cache first ───────────────────────────────────────────────
    vid = _extract_video_id(req.youtube_url)
    if vid and vid in DEMO_CACHE:
        logger.info("Cache HIT for video %s — returning instant demo response", vid)
        cached = DEMO_CACHE[vid]
        return {"notes": cached["notes"], "quiz": cached["quiz"][:req.num_questions], "quiz_count": len(cached["quiz"])}

    # ── Live AI pipeline ─────────────────────────────────────────────────────
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
    notes_raw = _call_with_retry(client, _make_video_contents(pass1_prompt, req.youtube_url), model=CONTENT_MODEL)
    notes = _strip_json(notes_raw)

    # ── Pass 2: notes → quiz bank, in batches of 10 (text-only, no video) ─────
    quiz: list = []
    notes_text = json.dumps(notes)
    batch_size  = 5  # smaller batches = less chance of truncation

    while len(quiz) < req.num_questions:
        remaining = min(batch_size, req.num_questions - len(quiz))
        already_asked = json.dumps([q["question"] for q in quiz])
        quiz_prompt = (
            f"From these lesson notes, write exactly {remaining} multiple-choice quiz questions. "
            "Use ONLY facts stated in the notes — do not invent anything. "
            "Return a JSON array where each element has these keys: "
            "question (string), options (array of exactly 4 strings), "
            "correct_index (integer 0-3), explanation (string). "
            f"Do NOT repeat: {already_asked}. "
            f"Notes: {notes_text}"
        )
        try:
            chunk_raw = _call_with_retry(client, [quiz_prompt], model=QUIZ_MODEL, json_mode=True)
            chunk = _strip_json(chunk_raw)
            if not isinstance(chunk, list) or not chunk:
                logger.warning("Quiz batch returned empty/invalid JSON — stopping early")
                break
            quiz.extend(chunk)
            logger.info("Quiz bank progress: %d/%d questions", len(quiz), req.num_questions)
        except Exception as e:
            logger.warning("Quiz generation stopped early: %s", e)
            break

    logger.info("Generation complete. notes keys=%s quiz_count=%d", list(notes.keys()), len(quiz))
    return {"notes": notes, "quiz": quiz[: req.num_questions], "quiz_count": len(quiz)}
