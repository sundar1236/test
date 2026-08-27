-- Migration 20240101000008: Performance Indexes for Question Bank, Mock Tests & Attempts
-- Optimizes queries for 4,000+ question scale and fast student attempt snapshot retrievals.

CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON public.questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_questions_section_id ON public.questions(section_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON public.questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_exam_section_status ON public.questions(exam_id, section_id, status);

CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON public.question_options(question_id);

CREATE INDEX IF NOT EXISTS idx_mock_tests_exam_id ON public.mock_tests(exam_id);
CREATE INDEX IF NOT EXISTS idx_mock_tests_is_published ON public.mock_tests(is_published);

CREATE INDEX IF NOT EXISTS idx_attempt_questions_attempt_id ON public.attempt_questions(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt_id ON public.attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON public.test_attempts(user_id);
