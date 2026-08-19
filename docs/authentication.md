# Authentication Documentation

**Engine:** Supabase Auth (JWT + Postgres RLS)

---

## Roles Supported

1. **`guest`**: Unauthenticated public visitors (access to landing page and public design docs).
2. **`student`**: Default authenticated student account (access to mock exams, bookmarks, profile, performance analytics).
3. **`question_reviewer`**: Content auditor (access to AI validation queue and question drafts).
4. **`admin`**: Content administrator (access to full Question Bank management, mock test series publishing).
5. **`super_admin`**: System administrator (full system access and role assignment).

---

## Authentication Flow

1. User registers via `authService.signUp(email, pass, fullName, role)`.
2. Supabase Auth creates record in `auth.users` and trigger populates `public.profiles`.
3. JWT token returned contains `sub` (User ID).
4. Client stores session with automatic token refresh (`persistSession: true`).
5. Client queries automatically pass JWT in Authorization headers to Supabase, where RLS evaluates permissions based on `auth.uid()`.
