# Mentoria Hub — Build Plan (paste into Claude Code)

Read `CLAUDE.md` first — it has the stack, architecture rules, palette, and
priority order. Follow those rules throughout.

**Current state (already done):** landing page, login/signup, Supabase connected,
deployed on Vercel.

**Your job:** build the remaining MVP features from the hackathon case. Build in
the PHASES below, **one phase at a time**. After each phase, stop, tell me what you
built, and how to test it before continuing. Commit after each working phase. Do not
build all phases in one pass — scoped phases produce better, fully-wired features.

Use Tailwind with the existing palette (`navy`, `brand`, `mint`, `brand-gradient`).
Frontend reads/writes Supabase directly (use the existing client). Keep everything
responsive and dark-mode by default. Use realistic mock/seed data so the journey
feels real.

---

## PHASE 0 — Data model + seed data (do this first)

Create a `supabase_schema.sql` file with these tables, then give me the SQL to run
in the Supabase SQL editor. Also create a `seed.sql` with realistic sample rows.

Tables:
- **profiles** — `id` (FK to auth.users), `full_name`, `grade` (int 8–11),
  `interests` (text[]), `subjects` (text[]), `goals` (text[]), `role`
  (text, default 'student'; 'admin' for admin users), `created_at`.
- **opportunities** — `id`, `title`, `category` (e.g. Competition, Scholarship,
  Internship, Summer School, Olympiad), `direction` (e.g. STEM, Business, Finance,
  Coding, Science, Social Impact), `format` (Online/Offline/Hybrid), `deadline`
  (date), `description`, `requirements`, `tags` (text[]), `created_at`.
- **saved_opportunities** — `id`, `user_id`, `opportunity_id`, `created_at`.
- **courses** — `id`, `title`, `description`, `level` (Beginner/Intermediate/Advanced),
  `subject` (text), `tags` (text[]), `created_at`.
- **lessons** — `id`, `course_id`, `title`, `position` (int), `content` (text),
  `video_url` (text, nullable), `summary` (text, nullable), `created_at`.
- **quiz_questions** — `id`, `lesson_id`, `question`, `options` (text[]),
  `correct_index` (int), `explanation` (text).
- **enrollments** — `id`, `user_id`, `course_id`, `created_at`.
- **lesson_progress** — `id`, `user_id`, `lesson_id`, `completed` (bool),
  `quiz_score` (int, nullable), `completed_at`.

Seed: **8–10 opportunities** across different categories/directions/deadlines,
**3 courses** (e.g. "English for Academic Success", "Foundations of Physics",
"Introduction to Economics") each with **3 lessons**, and each lesson with
**5 quiz questions**. Keep RLS relaxed for the hackathon but note in the SQL
comments that production would lock it down.

Stop after this phase and give me the SQL to run.

---

## PHASE 1 — Onboarding + recommendation logic (the demo's opening beat)

Build a multi-step onboarding flow shown after first signup:
- Step 1: grade (8–11). Step 2: interests/directions (multi-select chips: STEM,
  Business, Finance, Coding, Science, Social Impact). Step 3: subjects
  (Math, English, Physics, Biology, Economics, CS, SAT/IELTS). Step 4: goals
  (University prep, Competitions, Scholarships, Skill building).
- Save answers to the `profiles` row.
- Build a **recommendation function** (`src/lib/recommend.js`): score each
  opportunity and course by tag/direction/subject overlap with the profile.
  Return sorted matches. **Each result must include a `reason` string** like
  "Recommended because you're in grade 10 and interested in Business."
  (Explainable recommendations — this is a scoring differentiator.)

Stop and tell me how to test onboarding → profile saved → recommendations computed.

---

## PHASE 2 — Opportunities catalog (case section B)

- A catalog page rendering opportunity cards from Supabase: title, category tag,
  direction, format, deadline, short description, a **Save (heart)** toggle, and an
  **Apply** button.
- **Filters**: by category, direction, format, and grade/age. Plus a keyword search.
- **Deadline urgency**: show a countdown / "closing soon" styling for near deadlines
  (visual differentiator and demos well).
- Save toggles write to `saved_opportunities` and reflect immediately.

Stop and tell me how to test filtering, search, and saving.

---

## PHASE 3 — Courses + lesson player + quizzes (case section C)

- Courses list page: course cards with title, level badge, lesson count, and a
  **progress bar** (computed from `lesson_progress`).
- Course detail page: description, lesson list with completion status, an **Enroll**
  button (writes to `enrollments`).
- Lesson player page: embedded **YouTube iframe** (use `video_url`; placeholder if
  null), the lesson content/summary, and a **quiz** built from `quiz_questions`
  (multiple choice, show score + explanations on submit). On completion, write to
  `lesson_progress` (completed + quiz_score) so progress updates everywhere.

Stop and tell me how to test enroll → watch lesson → take quiz → progress updates.

---

## PHASE 4 — Student dashboard (case section D)

A dashboard pulling the student's real data:
- Saved opportunities (with deadlines).
- Enrolled courses with progress bars and a "continue" link to the next lesson.
- **Upcoming deadlines** list (sorted, with countdowns).
- A "Recommended for you" strip using the Phase 1 recommendation function.

Stop and tell me how to test that the dashboard reflects saves, enrollments, and progress.

---

## PHASE 5 — Admin panel (case section F — the scalability story)

Guard routes by `profiles.role === 'admin'`.
- Admin can **add / edit / delete opportunities** (form + table).
- Admin can **add / edit courses and lessons** (and quiz questions).
- New content appears instantly for students with no redeploy — make this visible.
- A small **stats tile**: total students, total opportunities, total enrollments,
  saves this week. Frame it as "Mentoria scales beyond manual Telegram updates."

Stop and tell me how to test adding an opportunity as admin and seeing it appear
for a student.

---

## PHASE 6 (signature feature — only after 0–5 work end-to-end) — AI lesson generation

Wire the existing FastAPI `/generate-lesson` endpoint into the admin course editor:
admin pastes a **public** YouTube URL → calls the backend via `src/api.js` →
backend returns notes + a quiz bank → admin reviews/saves it as a lesson + questions.
- Build a ~50-question bank per lesson; the student quiz serves a random subset.
- **Pre-generate and cache** output for the demo videos so the live demo is instant.
- Add retry/loading states so a slow Gemini call never looks broken.

Stop and report. This is the innovation highlight for the pitch.

---

## After all phases
- Confirm the full case journey works: onboarding → recommendations → save
  opportunity → enroll → finish lesson + quiz → dashboard updates → admin adds content.
- Make sure it's mobile-responsive.
- Suggest any quick bonus wins still cheap to add (EN/RU/KZ toggle, dark/light toggle,
  certificate on course completion, deadline calendar).

Start with **Phase 0** now. Give me the schema + seed SQL, then stop.
