-- ====================================================================
-- BANK CLERK MOCK TEST PLATFORM — COMPLETE SUPABASE DATABASE SETUP
-- Execute this ENTIRE script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/klzpmakufpfhjbokzaof/sql/new
-- ====================================================================

-- 1. DROP EXISTING CONFLICTING TYPES (IF RE-RUNNING)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('guest', 'student', 'question_reviewer', 'admin', 'super_admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exam_phase') THEN
        CREATE TYPE exam_phase AS ENUM ('prelims', 'mains');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level') THEN
        CREATE TYPE difficulty_level AS ENUM ('easy', 'moderate', 'hard');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_status') THEN
        CREATE TYPE question_status AS ENUM ('draft', 'under_review', 'validated', 'published', 'archived');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attempt_status') THEN
        CREATE TYPE attempt_status AS ENUM ('in_progress', 'completed', 'abandoned', 'auto_submitted');
    END IF;
END $$;

-- 2. USERS PROFILE TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'student',
  target_exam VARCHAR(50) DEFAULT 'SBI Clerk',
  joined_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. EXAMS TABLE
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TOPICS HIERARCHY TABLE
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  parent_topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. QUESTION SOURCES TABLE
CREATE TABLE IF NOT EXISTS public.question_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  source_type VARCHAR(50) NOT NULL,
  year INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. UNIFIED QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  phase exam_phase NOT NULL DEFAULT 'prelims',
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  source_id UUID REFERENCES public.question_sources(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  question_hash VARCHAR(64),
  normalized_text TEXT,
  difficulty difficulty_level NOT NULL DEFAULT 'moderate',
  explanation TEXT,
  status question_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. QUESTION OPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_key VARCHAR(5) NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT unique_question_option UNIQUE(question_id, option_key)
);

-- 9. QUESTION VALIDATION RECORD TABLE
CREATE TABLE IF NOT EXISTS public.question_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id),
  source_answer VARCHAR(5),
  ai_suggested_answer VARCHAR(5),
  ai_confidence_percent NUMERIC(5,2),
  review_notes TEXT,
  validated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MOCK TESTS TABLE
CREATE TABLE IF NOT EXISTS public.mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  total_questions INT NOT NULL DEFAULT 100,
  total_marks NUMERIC(6,2) NOT NULL DEFAULT 100.00,
  is_free_sample BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MOCK TEST SECTIONS CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS public.mock_test_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_test_id UUID NOT NULL REFERENCES public.mock_tests(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  section_order INT NOT NULL,
  question_count INT NOT NULL,
  marks_per_question NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  negative_marks NUMERIC(4,2) NOT NULL DEFAULT 0.25,
  duration_minutes INT
);

-- 12. MOCK TEST QUESTIONS MAPPING TABLE
CREATE TABLE IF NOT EXISTS public.mock_test_questions (
  mock_test_id UUID NOT NULL REFERENCES public.mock_tests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  question_order INT NOT NULL,
  PRIMARY KEY (mock_test_id, question_id)
);

-- 13. TEST ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mock_test_id UUID NOT NULL REFERENCES public.mock_tests(id) ON DELETE CASCADE,
  status attempt_status NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_spent_seconds INT NOT NULL DEFAULT 0,
  total_score NUMERIC(6,2) DEFAULT 0.00,
  max_score NUMERIC(6,2) NOT NULL DEFAULT 100.00,
  accuracy_percent NUMERIC(5,2) DEFAULT 0.00,
  estimated_percentile NUMERIC(5,2) DEFAULT 0.00,
  attempted_count INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  incorrect_count INT DEFAULT 0,
  skipped_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ATTEMPT ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES public.question_options(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'not_visited',
  time_spent_seconds INT DEFAULT 0,
  is_correct BOOLEAN,
  score_awarded NUMERIC(4,2) DEFAULT 0.00,
  CONSTRAINT unique_attempt_question UNIQUE(attempt_id, question_id)
);

-- 15. BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_bookmark UNIQUE(user_id, question_id)
);

-- 16. USER PROGRESS & TOPIC PERFORMANCE SUMMARY TABLE
CREATE TABLE IF NOT EXISTS public.user_topic_progress (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  total_questions_attempted INT DEFAULT 0,
  total_correct INT DEFAULT 0,
  accuracy_percent NUMERIC(5,2) DEFAULT 0.00,
  last_practiced_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, topic_id)
);

-- 17. IMPORT BATCHES & RECORDS TABLES
CREATE TABLE IF NOT EXISTS public.import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number VARCHAR(50) UNIQUE NOT NULL,
  importer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  importer_name VARCHAR(150),
  file_name VARCHAR(255) NOT NULL,
  file_format VARCHAR(20) NOT NULL CHECK (file_format IN ('csv', 'json')),
  total_records INT NOT NULL DEFAULT 0,
  success_count INT NOT NULL DEFAULT 0,
  failure_count INT NOT NULL DEFAULT 0,
  duplicate_count INT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'completed' CHECK (status IN ('preview', 'processing', 'completed', 'failed', 'rolled_back')),
  summary JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.import_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.import_batches(id) ON DELETE CASCADE,
  row_number INT NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
  raw_data JSONB NOT NULL,
  status VARCHAR(30) NOT NULL CHECK (status IN ('success', 'failed', 'duplicate_skipped', 'duplicate_merged', 'duplicate_overwritten', 'pending_review')),
  duplicate_match_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
  duplicate_type VARCHAR(30) CHECK (duplicate_type IN ('exact', 'near', 'potential')),
  error_message TEXT,
  field_errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. ADMIN AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  action VARCHAR(100) NOT NULL,
  target_entity VARCHAR(50) NOT NULL,
  target_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 20. RLS POLICIES
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Students view published questions" ON public.questions;
CREATE POLICY "Students view published questions" ON public.questions FOR SELECT USING (
  status = 'published' OR
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin', 'question_reviewer'))
);

DROP POLICY IF EXISTS "Admins manage questions" ON public.questions;
CREATE POLICY "Admins manage questions" ON public.questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

DROP POLICY IF EXISTS "Users manage own attempts" ON public.test_attempts;
CREATE POLICY "Users manage own attempts" ON public.test_attempts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own attempt answers" ON public.attempt_answers;
CREATE POLICY "Users manage own attempt answers" ON public.attempt_answers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.test_attempts WHERE test_attempts.id = attempt_answers.attempt_id AND test_attempts.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users manage own bookmarks" ON public.bookmarks;
CREATE POLICY "Users manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own progress" ON public.user_topic_progress;
CREATE POLICY "Users manage own progress" ON public.user_topic_progress FOR ALL USING (auth.uid() = user_id);

-- 21. ACCOUNT DELETION RPC FUNCTION
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated request.';
  END IF;

  DELETE FROM public.bookmarks WHERE user_id = v_user_id;
  DELETE FROM public.user_topic_progress WHERE user_id = v_user_id;
  DELETE FROM public.test_attempts WHERE user_id = v_user_id;
  DELETE FROM public.profiles WHERE id = v_user_id;
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- 22. SEED EXAM & SECTION REFERENCE DATA
INSERT INTO public.exams (code, title, description) VALUES
  ('SBI_CLERK', 'SBI Clerk 2024', 'State Bank of India Junior Associate Exam'),
  ('IBPS_CLERK', 'IBPS Clerk 2024', 'Institute of Banking Personnel Selection Clerk Exam'),
  ('RBI_ASSIST', 'RBI Assistant 2024', 'Reserve Bank of India Assistant Recruitment'),
  ('RRB_CLERK', 'RRB Office Assistant 2024', 'Regional Rural Banks Office Assistant Exam')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.sections (code, name) VALUES
  ('QUANT', 'Quantitative Aptitude'),
  ('REASONING', 'Reasoning Ability'),
  ('ENGLISH', 'English Language'),
  ('GA', 'General & Banking Awareness')
ON CONFLICT (code) DO NOTHING;

-- 23. AUTOMATIC PROFILE CREATION TRIGGER FOR AUTH USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 24. SYNC EXISTING AUTH USERS TO PROFILES (MAKING sundhar1301@gmail.com ADMIN)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  CASE
    WHEN email = 'sundhar1301@gmail.com' THEN 'admin'::user_role
    ELSE 'student'::user_role
  END
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET role = EXCLUDED.role,
    updated_at = NOW();
