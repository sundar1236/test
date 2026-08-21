# Database Schema Documentation

**Platform:** Bank Clerk Mock Test Platform
**Engine:** PostgreSQL (Supabase)

---

## Tables Overview

### 1. `profiles`
Extends Supabase `auth.users` with application specific user properties.
* `id` (UUID, Primary Key) -> FK to `auth.users.id`
* `full_name` (VARCHAR)
* `email` (VARCHAR, Unique)
* `role` (`user_role` ENUM: `guest`, `student`, `question_reviewer`, `admin`, `super_admin`)
* `target_exam` (VARCHAR)

### 2. `exams`
Stores target banking exam series.
* `id` (UUID, Primary Key)
* `code` (VARCHAR, Unique): `SBI_CLERK`, `IBPS_CLERK`, `RBI_ASSIST`, `RRB_CLERK`
* `title` (VARCHAR)
* `is_active` (BOOLEAN)

### 3. `sections`
Banking exam subject sections.
* `id` (UUID, Primary Key)
* `code` (VARCHAR, Unique): `QUANT`, `REASONING`, `ENGLISH`, `GA`
* `name` (VARCHAR)

### 4. `topics`
Topic hierarchy mapped to sections.
* `id` (UUID, Primary Key)
* `section_id` (UUID) -> FK to `sections.id`
* `parent_topic_id` (UUID, Nullable) -> Recursive FK to `topics.id` for sub-topics
* `title` (VARCHAR)

### 5. `question_sources`
Tracks origins of test questions.
* `id` (UUID, Primary Key)
* `name` (VARCHAR)
* `source_type` (VARCHAR): `previous_year`, `created_by_admin`, `ai_generated`
* `year` (INT)

### 6. `questions`
Unified Question Bank table for all banking categories.
* `id` (UUID, Primary Key)
* `exam_id` (UUID) -> FK to `exams.id`
* `section_id` (UUID) -> FK to `sections.id`
* `topic_id` (UUID) -> FK to `topics.id`
* `source_id` (UUID, Nullable) -> FK to `question_sources.id`
* `question_text` (TEXT)
* `difficulty` (`difficulty_level` ENUM: `easy`, `moderate`, `hard`)
* `explanation` (TEXT)
* `status` (`question_status` ENUM: `draft`, `under_review`, `validated`, `published`, `archived`)

### 7. `question_options`
Normalized option items for questions.
* `id` (UUID, Primary Key)
* `question_id` (UUID) -> FK to `questions.id`
* `option_key` (VARCHAR): 'A', 'B', 'C', 'D', 'E'
* `option_text` (TEXT)
* `is_correct` (BOOLEAN)

### 8. `question_validations`
AI parsing and review records.
* `id` (UUID, Primary Key)
* `question_id` (UUID) -> FK to `questions.id`
* `source_answer` (VARCHAR)
* `ai_suggested_answer` (VARCHAR)
* `ai_confidence_percent` (NUMERIC)

### 9. `mock_tests`
Full mock exam definition.
* `id` (UUID, Primary Key)
* `exam_id` (UUID) -> FK to `exams.id`
* `title` (VARCHAR)
* `duration_minutes` (INT)
* `total_questions` (INT)
* `is_published` (BOOLEAN)

### 10. `mock_test_questions`
Junction table mapping questions to specific mock tests in exact order.
* `mock_test_id` (UUID) -> FK to `mock_tests.id`
* `question_id` (UUID) -> FK to `questions.id`
* `question_order` (INT)
* Primary Key: (`mock_test_id`, `question_id`)

### 11. `test_attempts`
Records user test submissions and generated scores.
* `id` (UUID, Primary Key)
* `user_id` (UUID) -> FK to `profiles.id`
* `mock_test_id` (UUID) -> FK to `mock_tests.id`
* `total_score` (NUMERIC)
* `accuracy_percent` (NUMERIC)
* `estimated_percentile` (NUMERIC)

### 12. `attempt_answers`
User's itemized answers for each question attempted.
* `id` (UUID, Primary Key)
* `attempt_id` (UUID) -> FK to `test_attempts.id`
* `question_id` (UUID) -> FK to `questions.id`
* `selected_option_id` (UUID) -> FK to `question_options.id`
* `status` (VARCHAR): 'answered', 'not_answered', 'marked_for_review', 'not_visited'

### 13. `bookmarks`
Saved questions for user review.
* `id` (UUID, Primary Key)
* `user_id` (UUID) -> FK to `profiles.id`
* `question_id` (UUID) -> FK to `questions.id`

### 14. `user_topic_progress`
Aggregated topic mastery tracking.
* `user_id` (UUID) -> FK to `profiles.id`
* `topic_id` (UUID) -> FK to `topics.id`
* `accuracy_percent` (NUMERIC)
* Primary Key: (`user_id`, `topic_id`)

### 15. `admin_audit_logs`
Audit trails for admin operations.
* `id` (UUID, Primary Key)
* `admin_id` (UUID) -> FK to `profiles.id`
* `action` (VARCHAR)
* `target_entity` (VARCHAR)
* `details` (JSONB)
