-- Row Level Security (RLS) Policies Migration

-- Enable RLS on all protected tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. QUESTIONS POLICIES
CREATE POLICY "Students view published questions" ON questions
  FOR SELECT USING (
    status = 'published' OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'question_reviewer')
    )
  );

CREATE POLICY "Admins manage questions" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- 3. QUESTION OPTIONS POLICIES
CREATE POLICY "View options for accessible questions" ON question_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM questions
      WHERE questions.id = question_options.question_id
      AND (
        questions.status = 'published' OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('admin', 'super_admin', 'question_reviewer')
        )
      )
    )
  );

-- 4. TEST ATTEMPTS POLICIES (Strict User Isolation)
CREATE POLICY "Users view own attempts" ON test_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own attempts" ON test_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update active own attempts" ON test_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. ATTEMPT ANSWERS POLICIES
CREATE POLICY "Users manage own attempt answers" ON attempt_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM test_attempts
      WHERE test_attempts.id = attempt_answers.attempt_id
      AND test_attempts.user_id = auth.uid()
    )
  );

-- 6. BOOKMARKS POLICIES
CREATE POLICY "Users manage own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- 7. USER PROGRESS POLICIES
CREATE POLICY "Users manage own progress" ON user_topic_progress
  FOR ALL USING (auth.uid() = user_id);

-- 8. ADMIN AUDIT LOGS POLICIES
CREATE POLICY "Admins view audit logs" ON admin_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
