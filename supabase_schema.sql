-- =============================================================
-- Mentoria Hub — Database Schema
-- Run this first in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- NOTE: RLS policies are intentionally permissive for the hackathon demo.
--       Production would restrict reads to authenticated users and
--       writes to specific roles only.
-- =============================================================


-- ─── Profiles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  grade       INT CHECK (grade BETWEEN 8 AND 11),
  interests   TEXT[] DEFAULT '{}',
  subjects    TEXT[] DEFAULT '{}',
  goals       TEXT[] DEFAULT '{}',
  role        TEXT NOT NULL DEFAULT 'student',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create an empty profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles: own row" ON profiles
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);


-- ─── Opportunities ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS opportunities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  category     TEXT NOT NULL,  -- Competition | Scholarship | Internship | Summer School | Olympiad
  direction    TEXT NOT NULL,  -- STEM | Business | Finance | Coding | Science | Social Impact
  format       TEXT NOT NULL,  -- Online | Offline | Hybrid
  deadline     DATE NOT NULL,
  description  TEXT,
  requirements TEXT,
  tags         TEXT[] DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
-- Public read (landing page shows opportunities before login)
CREATE POLICY "opportunities: public read" ON opportunities FOR SELECT USING (true);
-- Only admins can insert/update/delete
CREATE POLICY "opportunities: admin write" ON opportunities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ─── Saved Opportunities ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_opportunities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, opportunity_id)
);

ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved: own rows" ON saved_opportunities
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ─── Courses ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  level       TEXT NOT NULL,  -- Beginner | Intermediate | Advanced
  subject     TEXT NOT NULL,
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses: public read" ON courses FOR SELECT USING (true);
CREATE POLICY "courses: admin write" ON courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ─── Lessons ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lessons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  position    INT NOT NULL,
  content     TEXT,
  video_url   TEXT,
  summary     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lessons: public read" ON lessons FOR SELECT USING (true);
CREATE POLICY "lessons: admin write" ON lessons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ─── Quiz Questions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id     UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question      TEXT NOT NULL,
  options       TEXT[] NOT NULL,
  correct_index INT NOT NULL,
  explanation   TEXT
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz: public read" ON quiz_questions FOR SELECT USING (true);
CREATE POLICY "quiz: admin write" ON quiz_questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ─── Enrollments ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enrollments: own rows" ON enrollments
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ─── Lesson Progress ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed    BOOL DEFAULT false,
  quiz_score   INT,
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, lesson_id)
);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress: own rows" ON lesson_progress
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
