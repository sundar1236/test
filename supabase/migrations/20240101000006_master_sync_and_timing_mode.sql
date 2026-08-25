-- Master Migration: Add timing_mode to mock_tests table & update types
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'mock_tests'
        AND column_name = 'timing_mode'
    ) THEN
        ALTER TABLE public.mock_tests
        ADD COLUMN timing_mode VARCHAR(20) NOT NULL DEFAULT 'time_based';
    END IF;
END $$;

COMMENT ON COLUMN public.mock_tests.timing_mode IS 'Exam timing mode: time_based or non_time_based';
