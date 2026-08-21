-- Supabase Admin Account Creation SQL Script
-- Execute this script in your Supabase SQL Editor to grant admin privileges to sundhar1301@gmail.com

-- 1. Ensure user profile exists with 'admin' role in public.profiles table
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  'usr-admin-sundhar',
  'sundhar1301@gmail.com',
  'Sundhar (Admin)',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    full_name = 'Sundhar (Admin)',
    updated_at = NOW();

-- 2. Ensure test student profile exists in public.profiles table
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  'usr-student-test',
  'student@test.com',
  'Test Student',
  'student',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET role = 'student',
    full_name = 'Test Student',
    updated_at = NOW();
