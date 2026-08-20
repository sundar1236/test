-- Migration: Import Batches, Import Records, and Duplicate Detection Indexes
-- Phase 3C Database Additions

-- 1. IMPORT BATCHES TABLE
CREATE TABLE IF NOT EXISTS import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number VARCHAR(50) UNIQUE NOT NULL,
  importer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
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

-- 2. IMPORT RECORDS LOG TABLE
CREATE TABLE IF NOT EXISTS import_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES import_batches(id) ON DELETE CASCADE,
  row_number INT NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
  raw_data JSONB NOT NULL,
  status VARCHAR(30) NOT NULL CHECK (status IN ('success', 'failed', 'duplicate_skipped', 'duplicate_merged', 'duplicate_overwritten', 'pending_review')),
  duplicate_match_id UUID REFERENCES questions(id) ON DELETE SET NULL,
  duplicate_type VARCHAR(30) CHECK (duplicate_type IN ('exact', 'near', 'potential')),
  error_message TEXT,
  field_errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ADD NORMALIZED TEXT & HASH COLUMNS TO QUESTIONS FOR DUPLICATE DETECTION
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS question_hash VARCHAR(64),
  ADD COLUMN IF NOT EXISTS normalized_text TEXT;

-- 4. PERFORMANCE & SEARCH INDEXES FOR 10,000+ QUESTION SCALABILITY
CREATE INDEX IF NOT EXISTS idx_questions_hash ON questions(question_hash);
CREATE INDEX IF NOT EXISTS idx_questions_status_created ON questions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_exam_phase_section ON questions(exam_id, phase, section_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic_difficulty ON questions(topic_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_import_records_batch ON import_records(batch_id, status);
CREATE INDEX IF NOT EXISTS idx_import_batches_status ON import_batches(status, created_at DESC);

-- 5. RLS POLICIES FOR IMPORT SYSTEM
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_records ENABLE ROW LEVEL SECURITY;

-- Admins and super_admins can manage import batches and records
CREATE POLICY "Admins can view import batches" ON import_batches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'question_reviewer')
    )
  );

CREATE POLICY "Admins can create/update import batches" ON import_batches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can view import records" ON import_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'question_reviewer')
    )
  );

CREATE POLICY "Admins can create/update import records" ON import_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
