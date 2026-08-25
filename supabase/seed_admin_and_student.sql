-- ====================================================================
-- SUPABASE AUTH & PROFILES SYNC SCRIPT FOR ADMIN & TEST STUDENT
-- Execute this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/klzpmakufpfhjhjbokzaof/sql/new
-- ====================================================================

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. INSERT OR UPDATE ADMIN USER (sundhar1301@gmail.com / sundar@1236)
DO $$
DECLARE
  v_admin_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sundhar1301@gmail.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'sundhar1301@gmail.com',
      extensions.crypt('sundar@1236', extensions.gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Sundhar (Admin)","role":"admin"}',
      NOW(), NOW(),
      'authenticated', 'authenticated'
    );
  END IF;
END $$;

-- 2. INSERT OR UPDATE TEST STUDENT USER (student@test.com / student123)
DO $$
DECLARE
  v_student_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'student@test.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES (
      v_student_id,
      '00000000-0000-0000-0000-000000000000',
      'student@test.com',
      extensions.crypt('student123', extensions.gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Test Student","role":"student"}',
      NOW(), NOW(),
      'authenticated', 'authenticated'
    );
  END IF;
END $$;

-- 3. ENSURE PROFILES TABLE HAS BOTH ACCOUNTS WITH PROPER ROLES
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
WHERE email IN ('sundhar1301@gmail.com', 'student@test.com')
ON CONFLICT (id) DO UPDATE
SET role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
