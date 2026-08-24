-- Migration: Immutable Exam Versions, Question Selection Rules, and Attempt Question Snapshots
-- Phase: Production Exam Builder & Randomization Architecture

-- 1. ADD VERSIONING, RULES & INSTRUCTIONS TO MOCK TESTS
ALTER TABLE mock_tests
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'published' CHECK (status IN ('draft', 'validating', 'ready', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS version_number INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_test_id UUID REFERENCES mock_tests(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS question_selection_rules JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS enable_option_randomization BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS instructions TEXT DEFAULT 'Read questions carefully. Each question carries 1 mark with 0.25 negative marking for incorrect choices.';

-- 2. CREATE IMMUTABLE ATTEMPT QUESTIONS SNAPSHOT TABLE
CREATE TABLE IF NOT EXISTS attempt_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  question_order INT NOT NULL,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  section_name VARCHAR(100),
  option_order_snapshot JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_attempt_question_snapshot UNIQUE(attempt_id, question_id)
);

-- Indexes for fast ordering & retrieval
CREATE INDEX IF NOT EXISTS idx_attempt_questions_attempt ON attempt_questions(attempt_id, question_order);
CREATE INDEX IF NOT EXISTS idx_mock_tests_parent_version ON mock_tests(parent_test_id, version_number);

-- 3. ENABLE RLS ON ATTEMPT QUESTIONS
ALTER TABLE attempt_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own attempt question snapshots" ON attempt_questions;
CREATE POLICY "Users view own attempt question snapshots" ON attempt_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM test_attempts
      WHERE test_attempts.id = attempt_questions.attempt_id
      AND test_attempts.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users insert own attempt question snapshots" ON attempt_questions;
CREATE POLICY "Users insert own attempt question snapshots" ON attempt_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM test_attempts
      WHERE test_attempts.id = attempt_questions.attempt_id
      AND test_attempts.user_id = auth.uid()
    )
  );

-- Also allow admins full management on mock_tests
DROP POLICY IF EXISTS "Admins manage mock tests" ON mock_tests;
CREATE POLICY "Admins manage mock tests" ON mock_tests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Students view published mock tests
DROP POLICY IF EXISTS "Students view published mock tests" ON mock_tests;
CREATE POLICY "Students view published mock tests" ON mock_tests
  FOR SELECT USING (
    is_published = TRUE OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
