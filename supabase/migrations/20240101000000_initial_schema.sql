-- Initial Schema Migration for Bank Clerk Mock Test Platform
-- Database: PostgreSQL (Supabase)

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('guest', 'student', 'question_reviewer', 'admin', 'super_admin');
CREATE TYPE exam_phase AS ENUM ('prelims', 'mains');
CREATE TYPE difficulty_level AS ENUM ('easy', 'moderate', 'hard');
CREATE TYPE question_status AS ENUM ('draft', 'under_review', 'validated', 'published', 'archived');
CREATE TYPE attempt_status AS ENUM ('in_progress', 'completed', 'abandoned', 'auto_submitted');

-- 2. USERS PROFILE TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
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
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SECTIONS TABLE
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TOPICS HIERARCHY TABLE
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  parent_topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. QUESTION SOURCES TABLE
CREATE TABLE IF NOT EXISTS question_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  source_type VARCHAR(50) NOT NULL,
  year INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. UNIFIED QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  phase exam_phase NOT NULL DEFAULT 'prelims',
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  source_id UUID REFERENCES question_sources(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  difficulty difficulty_level NOT NULL DEFAULT 'moderate',
  explanation TEXT,
  status question_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. QUESTION OPTIONS TABLE (Normalized)
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_key VARCHAR(5) NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT unique_question_option UNIQUE(question_id, option_key)
);

-- 9. QUESTION VALIDATION RECORD TABLE
CREATE TABLE IF NOT EXISTS question_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id),
  source_answer VARCHAR(5),
  ai_suggested_answer VARCHAR(5),
  ai_confidence_percent NUMERIC(5,2),
  review_notes TEXT,
  validated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MOCK TESTS TABLE
CREATE TABLE IF NOT EXISTS mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  total_questions INT NOT NULL DEFAULT 100,
  total_marks NUMERIC(6,2) NOT NULL DEFAULT 100.00,
  is_free_sample BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MOCK TEST SECTIONS CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS mock_test_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_test_id UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  section_order INT NOT NULL,
  question_count INT NOT NULL,
  marks_per_question NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  negative_marks NUMERIC(4,2) NOT NULL DEFAULT 0.25,
  duration_minutes INT
);

-- 12. MOCK TEST QUESTIONS MAPPING TABLE
CREATE TABLE IF NOT EXISTS mock_test_questions (
  mock_test_id UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  question_order INT NOT NULL,
  PRIMARY KEY (mock_test_id, question_id)
);

-- 13. TEST ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mock_test_id UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'not_visited',
  time_spent_seconds INT DEFAULT 0,
  is_correct BOOLEAN,
  score_awarded NUMERIC(4,2) DEFAULT 0.00,
  CONSTRAINT unique_attempt_question UNIQUE(attempt_id, question_id)
);

-- 15. BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_bookmark UNIQUE(user_id, question_id)
);

-- 16. USER PROGRESS & TOPIC PERFORMANCE SUMMARY TABLE
CREATE TABLE IF NOT EXISTS user_topic_progress (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  total_questions_attempted INT DEFAULT 0,
  total_correct INT DEFAULT 0,
  accuracy_percent NUMERIC(5,2) DEFAULT 0.00,
  last_practiced_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, topic_id)
);

-- 17. ADMIN AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  target_entity VARCHAR(50) NOT NULL,
  target_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE & FAST FILTERING
CREATE INDEX IF NOT EXISTS idx_questions_exam_section ON questions(exam_id, section_id, status);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id, status);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user ON test_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt ON attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
