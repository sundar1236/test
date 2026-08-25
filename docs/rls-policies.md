# Row Level Security (RLS) Policies Documentation

**Engine:** PostgreSQL Row Level Security (Supabase)

---

## Enabled Tables

RLS is explicitly enabled on all user-facing and admin tables:
`profiles`, `questions`, `question_options`, `question_validations`, `mock_tests`, `test_attempts`, `attempt_answers`, `bookmarks`, `user_topic_progress`, `admin_audit_logs`.

---

## Policy Definitions

### 1. `profiles`
* **Users can view own profile:**
  `SELECT` allowed if `auth.uid() = id`.
* **Users can update own profile:**
  `UPDATE` allowed if `auth.uid() = id`.

### 2. `questions`
* **Students view published questions:**
  `SELECT` allowed if `status = 'published'` OR user role in `('admin', 'super_admin', 'question_reviewer')`.
* **Admins manage questions:**
  `ALL` (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) allowed if user role in `('admin', 'super_admin')`.

### 3. `question_options`
* **View options for accessible questions:**
  `SELECT` allowed if parent question is `status = 'published'` OR user is admin/reviewer.

### 4. `test_attempts` & `attempt_answers`
* **Users view and manage own attempts:**
  Strict user isolation enforcing `user_id = auth.uid()`. Cross-user attempt reading is completely blocked at database level.

### 5. `bookmarks` & `user_topic_progress`
* **Users manage own bookmarks & progress:**
  `ALL` operations enforced via `user_id = auth.uid()`.

### 6. `admin_audit_logs`
* **Admins view audit logs:**
  `SELECT` restricted to profiles with `role IN ('admin', 'super_admin')`.
