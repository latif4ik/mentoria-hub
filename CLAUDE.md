# Mentoria Hub — Project Context

EdTech hackathon MVP, due **June 18**. Students grades 8–11 discover educational
opportunities (competitions, olympiads, scholarships, internships, summer schools)
**and** take self-paced async courses. Audience: ambitious high-schoolers in
Kazakhstan and internationally, preparing for university.

## Core product idea
Two functions in ONE coherent product, not two bolted-together apps:
opportunities and courses link to each other (e.g. "you saved this hackathon →
here's a prep course", "this scholarship needs IELTS → here's the IELTS course").

## Stack
- **Frontend:** React (Vite + Tailwind). Talks to Supabase **directly** for CRUD/auth.
- **Backend:** FastAPI — a thin AI service ONLY (Gemini calls). Not a general API layer.
- **DB/Auth:** Supabase (Postgres + Auth), cloud-hosted, no container.
- **AI:** Gemini Flash (free tier, native YouTube URL understanding).

## Architecture rules (do not violate)
- Frontend → Supabase directly for data/auth. Backend exists ONLY for Gemini.
- **Gemini API key is backend-only, NEVER in the frontend.** Supabase anon key in
  the frontend is fine (it's public by design).
- Frontend reads the backend URL from `VITE_API_URL` (localhost in dev, Railway URL
  in prod) — never hardcode the backend address.

## Palette (already in tailwind.config.js)
- `navy` #0F1A2A (background), `brand` #2E9BE6 (blue), `mint` #27D8B0 (cyan)
- `brand-gradient` = blue→cyan, reserved for primary buttons / key highlights
- Dark mode is default.

## AI pipeline (in backend/main.py: POST /generate-lesson)
- **Pass 1:** YouTube URL → structured notes + summary + timestamped outline.
  This is the ONLY call that processes the video (expensive — do it once).
- **Pass 2:** notes → quiz, generated in **batches of 10** (text-only, cheap,
  no video reprocessing). Build a **bank of ~50**, serve a random 10 to students.
- Guardrails already in code: retry-on-429 backoff, JSON-fence stripping,
  "only use facts in the video", graceful stop instead of crash.
- Videos must be **public** on YouTube for Gemini to read them.

## Deploy (one monorepo, two hosts)
- **Vercel** = frontend, Root Directory `frontend`. Ignores the frontend Dockerfile,
  uses its own Vite build. `package.json` is the source of truth for deps.
- **Railway** = backend, Root Directory `backend`, uses `backend/Dockerfile`.
- Env vars set in each dashboard, NOT from the gitignored `.env`:
  - Gemini key → Railway (backend)
  - Supabase URL + anon key, and `VITE_API_URL` (= Railway backend URL) → Vercel (frontend)
- Docker is for LOCAL team consistency only; the hosts build their own way.

## Build priority (most important section)
1. **Get the required journey working end-to-end FIRST** — this is the heaviest
   scoring criterion (Functionality 25%):
   onboarding → recommendations → save opportunity → enroll in course →
   finish a lesson + quiz → dashboard updates → admin adds content.
2. THEN layer the AI generation on as the signature feature.
3. Do NOT let AI work eat the days needed for the core CRUD journey.

## Demo discipline
**Pre-generate and cache** AI lesson output for the demo videos so the live demo is
instant and cannot fail on stage. The pipeline being real and the demo being cached
are not in tension.

## Working style for Claude Code
- One screen at a time, in the priority order above. Don't scatter across many
  half-built features.
- Scope tasks tightly ("build the catalog page with filters from Supabase table X"),
  not "build the app".
- Commit after each working screen so there's always a deployable demo state.
