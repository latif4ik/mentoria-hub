# Mentoria Hub

EdTech MVP — discover educational opportunities + take self-paced courses.

## Stack
- **Frontend:** React (Vite + Tailwind), talks to Supabase directly for data/auth
- **Backend:** FastAPI — a thin AI service that turns a YouTube link into lesson notes + a quiz bank via Gemini
- **DB/Auth:** Supabase (cloud-hosted, no container needed)
- **AI:** Gemini Flash (free tier, native YouTube understanding)

## Why Docker
So the whole team runs the exact same environment with one command — no
"works on my machine" dependency problems.

## First-time setup
1. Install **Docker Desktop**.
2. Copy the env file and fill in your keys:
   ```bash
   cp .env.example .env
   # then edit .env with your Gemini + Supabase keys
   ```
3. Start everything:
   ```bash
   docker compose up --build
   ```
4. Open:
   - Frontend → http://localhost:5173
   - Backend health check → http://localhost:8000/health

To stop: `Ctrl+C`, or `docker compose down`.

## Day-to-day
- Code in `frontend/src` and `backend/` — both live-reload inside the containers.
- Added a Python package? Add it to `backend/requirements.txt`, then
  `docker compose up --build` once to rebuild.
- Added an npm package? Add it to `frontend/package.json`, then rebuild the same way.

## Project layout
```
mentoria-hub/
├── docker-compose.yml      # runs frontend + backend together
├── .env.example            # copy to .env, add your keys
├── frontend/               # React + Vite + Tailwind
│   └── src/                # paste Stitch-exported components here
└── backend/                # FastAPI AI service
    └── main.py             # /generate-lesson endpoint (video -> notes + quiz)
```

## Notes
- Supabase **anon** key is public and safe in the browser. The **Gemini** key
  is server-side only (backend) and must never reach the frontend.
- For the demo, pre-generate lesson content and cache it so it loads instantly.

## Deployment (one repo, two hosts)

Single monorepo. Each host builds its own subfolder.

| | Local (`docker compose`) | Production |
|---|---|---|
| Frontend | uses `frontend/Dockerfile` | **Vercel** ignores it, runs its own Vite build |
| Backend | uses `backend/Dockerfile` | **Railway** uses `backend/Dockerfile` |

### Vercel (frontend)
1. Import the GitHub repo.
2. **Set Root Directory = `frontend`** (critical — else the build fails).
3. Add env vars in the Vercel dashboard: `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL` (= your Railway backend URL).
4. `package.json` is the source of truth for dependencies — Vercel reads it,
   not the Dockerfile. Any new npm package must be added there.

### Railway (backend)
1. Import the **same** repo.
2. Create a service, **Set Root Directory = `backend`** (uses the Dockerfile).
3. Add env var in the Railway dashboard: `GEMINI_API_KEY`.
4. Copy the public URL Railway gives you → paste it as `VITE_API_URL` in Vercel.

### Notes
- Both hosts auto-deploy on every push to GitHub from the same commit.
- Env vars come from the dashboards, never from the gitignored `.env`.
- Gemini key lives ONLY on Railway. Supabase anon key + API URL live on Vercel.
