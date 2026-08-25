-- Migration 20240101000003: Account Deletion RPC Function
-- Allows authenticated users to permanently delete their own user account and application data

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Retrieve the authenticated caller user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated request. User must be logged in to delete account.';
  END IF;

  -- 1. Delete user-owned bookmarks
  DELETE FROM public.bookmarks WHERE user_id = v_user_id;

  -- 2. Delete user-owned topic progress
  DELETE FROM public.user_topic_progress WHERE user_id = v_user_id;

  -- 3. Delete user-owned test attempts (attempt_answers cascade automatically)
  DELETE FROM public.test_attempts WHERE user_id = v_user_id;

  -- 4. Delete user profile record
  DELETE FROM public.profiles WHERE id = v_user_id;

  -- 5. Permanently remove the user from auth.users
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
