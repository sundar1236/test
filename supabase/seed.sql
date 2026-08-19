-- Seed SQL Script for Supabase PostgreSQL Initialization

INSERT INTO exams (code, title, description) VALUES
  ('SBI_CLERK', 'SBI Clerk 2024', 'State Bank of India Junior Associate Exam'),
  ('IBPS_CLERK', 'IBPS Clerk 2024', 'Institute of Banking Personnel Selection Clerk Exam'),
  ('RBI_ASSIST', 'RBI Assistant 2024', 'Reserve Bank of India Assistant Recruitment'),
  ('RRB_CLERK', 'RRB Office Assistant 2024', 'Regional Rural Banks Office Assistant Exam')
ON CONFLICT (code) DO NOTHING;

INSERT INTO sections (code, name) VALUES
  ('QUANT', 'Quantitative Aptitude'),
  ('REASONING', 'Reasoning Ability'),
  ('ENGLISH', 'English Language'),
  ('GA', 'General & Banking Awareness')
ON CONFLICT (code) DO NOTHING;
