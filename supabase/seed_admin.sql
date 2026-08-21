-- Supabase Admin Account Creation SQL Script
-- Execute this script in your Supabase SQL Editor to grant admin privileges to sundhar1301@gmail.com

-- 1. Ensure user profile exists with 'admin' role in public.profiles table by matching email
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Sundhar (Admin)'),
  'admin'::user_role,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'sundhar1301@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin'::user_role,
    full_name = 'Sundhar (Admin)',
    updated_at = NOW();

-- 2. Ensure test student profile exists in public.profiles table
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Test Student'),
  'student'::user_role,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'student@test.com'
ON CONFLICT (id) DO UPDATE
SET role = 'student'::user_role,
    full_name = 'Test Student',
    updated_at = NOW();
