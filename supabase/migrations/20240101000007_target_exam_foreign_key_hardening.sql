-- Hardening Migration: Add target_exam_id FK referencing exams(id) & Data Migration
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'target_exam_id'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN target_exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Data Migration: Map legacy target_exam text to exams.id
UPDATE public.profiles p
SET target_exam_id = e.id
FROM public.exams e
WHERE p.target_exam_id IS NULL
  AND (
    (p.target_exam ILIKE '%SBI%' AND e.code = 'SBI_CLERK') OR
    (p.target_exam ILIKE '%IBPS%' AND e.code = 'IBPS_CLERK') OR
    (p.target_exam ILIKE '%RBI%' AND e.code = 'RBI_ASSIST') OR
    (p.target_exam ILIKE '%RRB%' AND e.code = 'RRB_CLERK') OR
    (p.target_exam = e.title)
  );

COMMENT ON COLUMN public.profiles.target_exam_id IS 'Foreign key referencing public.exams.id for canonical target exam relationship';
