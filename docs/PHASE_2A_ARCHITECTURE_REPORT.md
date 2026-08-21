# Phase 2A: Database & Application Architecture Report

**Platform:** Bank Clerk Mock Test Platform (SBI Clerk, IBPS Clerk, RBI Assistant, RRB Clerk)
**Target Environment:** Netlify (Frontend Hosting) + Supabase / PostgreSQL (Backend, Database, Auth, Storage)
**Status:** Architectural Specification & Design (Phase 2A — Non-destructive / Design-Only)

---

## A. Current Project Audit Report

### 1. Structure & Tech Stack
* **Framework:** React 18.3.1 with TypeScript (`.tsx` / `.ts`), Vite 5.4, React Router v6.
* **Styling & UI:** Tailwind CSS v4, custom CSS variable design tokens (`#0F4C81` Banking Blue, `#2563EB`, `#22C55E`, `#F59E0B`, `#EF4444`, `#F8FAFC`, `#0F172A`), Lucide React Icons (`lucide-react`), and Recharts 3.10.
* **State Management:** Centralized React Context (`src/context/AppContext.tsx`) managing active role, dark/light theme, bookmarks, question bank, test attempt records, and user profile.
* **Local Persistence:** All state synchronization is currently bound to browser `localStorage` keys (`bank_app_role`, `bank_app_theme`, `bank_app_bookmarks`, `bank_app_questions`, `bank_app_test_attempts`, `bank_app_user_profile`).
* **Components & Views:**
  * **Public / Guest:** `LandingPage.tsx` (Hero, Exam Cards, Features, CTAs).
  * **Student Experience:** `StudentDashboard.tsx`, `QuestionBank.tsx` (Search & expandable solutions), `TopicTests.tsx`, `MockTestList.tsx`, `ExamSimulatorScreen.tsx` (Full screen timer, section locks, question palette, auto-save), `ResultScreen.tsx` (Score, accuracy, percentile, section breakdowns), `PerformanceAnalytics.tsx` (Recharts Line, Bar, Pie charts), `BookmarkScreen.tsx`, `ProfileScreen.tsx`.
  * **Admin Experience:** `AdminDashboard.tsx`, `QuestionManagement.tsx` (Single question creation modal & bulk CSV upload simulator), `ValidationQueue.tsx` (AI vs. source answer comparison & approval workflow).
  * **Docs:** `DesignSystemDoc.tsx` (Tokens, typography, RBAC access matrix, responsive rules).

### 2. Cleanup & Legacy Items Identified
* **Legacy Boilerplate Files:** Unused JavaScript files from initial repo setup (`src/pages/about.jsx`, `blog.jsx`, `contact.jsx`, `home.jsx`, `projects.jsx`, `single-blog.jsx`, `single-project.jsx`, `src/route/router.jsx`, `src/App.jsx`, `src/main.jsx`). These do not affect production Vite build but can be cleaned up in future maintenance phases.
* **Environment Variables:** Currently absent. Needs `.env.example` defining `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## B. Recommended Technology Architecture

```text
  [ Client Browser ]
         │
         ▼
 ┌──────────────────────────┐
 │ Netlify CDN (Frontend)   │
 │ React + TS + Tailwind    │
 └─────────────┬────────────┘
               │
    Direct Supabase SDK (Anon Key)
               │
         ┌─────┴──────────────────────────────┐
         ▼                                    ▼
┌──────────────────────────────┐   ┌─────────────────────────────┐
│ Supabase Auth & Postgres     │   │ Netlify / Edge Functions    │
│ (RLS Protected Tables & RPC) │   │ (Privileged Admin / AI Task)│
└──────────────────────────────┘   └─────────────────────────────┘
```

### Direct Supabase Client vs. Serverless Functions

1. **Direct Client Access (Supabase Client SDK + RLS):**
   * **Operations:** Standard queries (fetch published questions, fetch user bookmarks, submit test attempt, fetch user analytics, update user profile).
   * **Security:** Enforced at the Postgres level via Row Level Security (RLS) policies using authenticated JWTs (`auth.uid()`). No serverless function overhead needed for standard CRUD.

2. **Server-Side Protected Operations (Netlify Functions / Supabase Edge Functions):**
   * **Operations:**
     * **Test Answer Verification & Score Calculation (Optional Secure Mode):** Preventing user inspection of answers prior to submission by evaluating completed answers on the backend.
     * **AI Question Ingestion & Validation Processing:** Parsing external CSV/PDF feeds, invoking LLM endpoints for suggested explanations, and inserting draft questions into the database using `SUPABASE_SERVICE_ROLE_KEY`.
     * **Bulk Import / Export Jobs:** Processing large question dumps safely.

---

## C. Application Architecture Layering

To prevent scattering business logic across React components, the application enforces a strict 4-tier layered architecture:

```text
UI Components (src/pages, src/components)
         ↓
Custom Hooks (src/hooks/useMockTest.ts, useQuestions.ts, useAuth.ts)
         ↓
Service Layer (src/services/testService.ts, questionService.ts, authService.ts)
         ↓
Supabase Client / Database Layer (src/lib/supabaseClient.ts → PostgreSQL)
```

### Layer Responsibilities
* **UI Layer (`src/pages/`, `src/components/`):** Pure presentation, event handling, and rendering loading/error states.
* **Hooks Layer (`src/hooks/`):** Manages local state, timers, cache invalidation, and data binding.
* **Service Layer (`src/services/`):** Encapsulates API calls, payload mapping, score calculations, and validation logic.
* **Database Client Layer (`src/lib/`):** Configures Supabase client instance, query builders, and type definitions.

---

## D. Database Entity Architecture & Schema Design

Below is the complete, normalized PostgreSQL schema designed for high-scale exam preparation:

```sql
-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('guest', 'student', 'question_reviewer', 'admin', 'super_admin');
CREATE TYPE exam_phase AS ENUM ('prelims', 'mains');
CREATE TYPE difficulty_level AS ENUM ('easy', 'moderate', 'hard');
CREATE TYPE question_status AS ENUM ('draft', 'under_review', 'validated', 'published', 'archived');
CREATE TYPE attempt_status AS ENUM ('in_progress', 'completed', 'abandoned', 'auto_submitted');

-- 2. USERS PROFILE TABLE (Extends supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'student',
  target_exam VARCHAR(50) DEFAULT 'SBI Clerk',
  joined_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. EXAMS TABLE
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'SBI_CLERK', 'IBPS_CLERK', 'RBI_ASSISTANT', 'RRB_CLERK'
  title VARCHAR(100) NOT NULL,       -- e.g. 'SBI Clerk 2024'
  description TEXT,
  icon_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SECTIONS TABLE
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'QUANT', 'REASONING', 'ENGLISH', 'GA'
  name VARCHAR(100) NOT NULL,        -- e.g. 'Quantitative Aptitude'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TOPICS HIERARCHY TABLE
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  parent_topic_id UUID REFERENCES topics(id) ON DELETE SET NULL, -- Enables sub-topics
  title VARCHAR(150) NOT NULL,                                    -- e.g. 'Profit & Loss'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. QUESTION SOURCES TABLE
CREATE TABLE question_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL, -- e.g. 'SBI Clerk Prelims 2023 Official Memory Based Paper'
  source_type VARCHAR(50) NOT NULL, -- 'previous_year', 'created_by_admin', 'ai_generated'
  year INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. UNIFIED QUESTIONS TABLE
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  phase exam_phase NOT NULL DEFAULT 'prelims',
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  source_id UUID REFERENCES question_sources(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  difficulty difficulty_level NOT NULL DEFAULT 'moderate',
  explanation TEXT,
  status question_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. QUESTION OPTIONS TABLE (Normalized)
CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_key VARCHAR(5) NOT NULL, -- 'A', 'B', 'C', 'D', 'E'
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT unique_question_option UNIQUE(question_id, option_key)
);

-- 9. QUESTION VALIDATION RECORD TABLE
CREATE TABLE question_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id),
  source_answer VARCHAR(5),
  ai_suggested_answer VARCHAR(5),
  ai_confidence_percent NUMERIC(5,2),
  review_notes TEXT,
  validated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MOCK TESTS TABLE
CREATE TABLE mock_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  total_questions INT NOT NULL DEFAULT 100,
  total_marks NUMERIC(6,2) NOT NULL DEFAULT 100.00,
  is_free_sample BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MOCK TEST SECTIONS CONFIGURATION TABLE
CREATE TABLE mock_test_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_test_id UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  section_order INT NOT NULL,
  question_count INT NOT NULL,
  marks_per_question NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  negative_marks NUMERIC(4,2) NOT NULL DEFAULT 0.25,
  duration_minutes INT -- Nullable: supports future sectional timing lock
);

-- 12. MOCK TEST QUESTIONS MAPPING TABLE
CREATE TABLE mock_test_questions (
  mock_test_id UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  question_order INT NOT NULL,
  PRIMARY KEY (mock_test_id, question_id)
);

-- 13. TEST ATTEMPTS TABLE
CREATE TABLE test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mock_test_id UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  status attempt_status NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_spent_seconds INT NOT NULL DEFAULT 0,
  total_score NUMERIC(6,2) DEFAULT 0.00,
  max_score NUMERIC(6,2) NOT NULL DEFAULT 100.00,
  accuracy_percent NUMERIC(5,2) DEFAULT 0.00,
  estimated_percentile NUMERIC(5,2) DEFAULT 0.00,
  attempted_count INT DEFAULT 0,
  correct_count INT DEFAULT 0,
  incorrect_count INT DEFAULT 0,
  skipped_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ATTEMPT ANSWERS TABLE
CREATE TABLE attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'not_visited', -- 'answered', 'not_answered', 'marked_for_review', 'not_visited'
  time_spent_seconds INT DEFAULT 0,
  is_correct BOOLEAN,
  score_awarded NUMERIC(4,2) DEFAULT 0.00,
  CONSTRAINT unique_attempt_question UNIQUE(attempt_id, question_id)
);

-- 15. BOOKMARKS TABLE
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_bookmark UNIQUE(user_id, question_id)
);

-- 16. USER PROGRESS & TOPIC PERFORMANCE SUMMARY TABLE
CREATE TABLE user_topic_progress (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  total_questions_attempted INT DEFAULT 0,
  total_correct INT DEFAULT 0,
  accuracy_percent NUMERIC(5,2) DEFAULT 0.00,
  last_practiced_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, topic_id)
);

-- 17. ADMIN AUDIT LOG TABLE
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL, -- 'QUESTION_APPROVED', 'TEST_PUBLISHED', 'BULK_IMPORT'
  target_entity VARCHAR(50) NOT NULL,
  target_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## E. Entity Relationship Diagram (ERD)

```text
       ┌───────────┐
       │   Exams   │
       └─────┬─────┘
             │ 1
             │
             │ N
       ┌─────┴─────┐           ┌────────────┐
       │ Questions ├───────────┤  Options   │
       └─────┬─────┘ 1       N └────────────┘
             │
             ├──────────────────┐
             │ N                │ N
       ┌─────┴─────┐      ┌─────┴────────┐
       │  Topics   │      │ Validations  │
       └─────┬─────┘      └──────────────┘
             │ 1
             │
             │ 1
       ┌─────┴─────┐
       │ Sections  │
       └───────────┘

 ┌──────────────┐           ┌──────────────┐           ┌─────────────────┐
 │   Profiles   ├───────────┤ Test Attempts├───────────┤ Attempt Answers │
 └──────┬───────┘ 1       N └──────┬───────┘ 1       N └────────┬────────┘
        │                          │                            │
        │ 1                        │ N                          │ N
        │                          │                            │
 ┌──────┴───────┐           ┌──────┴───────┐                    │
 │  Bookmarks   │           │  Mock Tests  ├────────────────────┘
 └──────────────┘           └──────────────┘ 1
```

---

## F. Question Bank & Test Generation Architecture

### 1. Unified Question Bank Design
All questions reside in a single `questions` table tagged with metadata (`exam_id`, `phase`, `section_id`, `topic_id`, `difficulty`, `status`). Separate exam tables (e.g. `sbi_questions`) are strictly avoided. Cross-exam relevance is handled via a `question_exam_relevance` junction table if a question applies to multiple exams simultaneously.

### 2. Test Generation Strategy: Fixed Set vs. Dynamic Generation
* **Recommendation:** **Fixed Mapping with Dynamic Assembly Ability (`mock_test_questions`).**
* **Reasoning:** For high-stakes banking mock exams (SBI/IBPS Clerk), all students competing for percentile rankings must attempt the exact same balanced test set to make percentile and global rank calculations statistically valid and comparable.
* **Workflow:**
  1. Admin creates a Mock Test definition (`mock_tests`).
  2. System auto-selects or admin curates `PUBLISHED` questions matching section distribution rules.
  3. Mapped IDs are stored in `mock_test_questions`.

---

## G. User State Boundary (localStorage vs. Database)

| Category | Storage Location | Specific Items |
| :--- | :--- | :--- |
| **Client UI State** | `localStorage` | Active dark/light theme, collapsed sidebar state, active dev role switcher toggle (development mode only). |
| **Temporary Session** | `localStorage` (Cache) | In-flight exam simulator response snapshot for immediate crash recovery if the browser reloads mid-exam. |
| **Persistent Data** | Supabase PostgreSQL | User accounts, profiles, completed test attempts, detailed itemized answers, bookmarks, user topic progress, question bank, and admin audit logs. |

---

## H. Admin Lifecycle & Workflow

```text
 [ Admin / Ingestion ]
         │
         ▼
     ( DRAFT )
         │
         ▼
  ( UNDER REVIEW )  ───► AI Validation Queue compares source & AI answers
         │
         ▼
    ( VALIDATED )   ───► Approved by Question Reviewer
         │
         ▼
    ( PUBLISHED )   ───► Available for Mock Test Generation Engine
         │
         ▼
    ( ARCHIVED )    ───► Deprecated / Pattern Changed
```

### Role Access Control Matrix
* **Student:** `SELECT` on `questions` (published only, via test interface), `SELECT/INSERT/UPDATE` on own `test_attempts`, `bookmarks`, `user_topic_progress`.
* **Question Reviewer:** Student permissions + `SELECT/UPDATE` on `questions` in `draft`/`under_review` states, `INSERT` on `question_validations`.
* **Admin / Super Admin:** Full system access including publishing, user role management, test configuration, and viewing `admin_audit_logs`.

---

## I. Supabase Auth & Row Level Security (RLS) Policies

### RLS Enforcements

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICY
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. QUESTIONS POLICY (Students see PUBLISHED questions only; Admins see ALL)
CREATE POLICY "Students view published questions" ON questions
  FOR SELECT USING (
    status = 'published' OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'question_reviewer')
    )
  );

CREATE POLICY "Admins manage questions" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- 3. TEST ATTEMPTS POLICY (Strict User Isolation)
CREATE POLICY "Users view and insert own attempts" ON test_attempts
  FOR ALL USING (auth.uid() = user_id);

-- 4. BOOKMARKS POLICY
CREATE POLICY "Users manage own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);
```

---

## J. Security & Vulnerability Analysis

1. **Question Answer Exposure Prevention:**
   * *Risk:* If full question objects (including `is_correct` and explanations) are returned in client JSON payloads at the start of a mock exam, students could inspect network logs to find answers.
   * *Mitigation Strategy:* For active mock exams, client queries fetch questions joined with options **excluding** `is_correct`. Upon test submission, answers are evaluated via a database RPC function (`submit_test_attempt()`) or serverless function, returning final scores and explanations **only after** completion.

2. **Client-Side Manipulation:**
   * Score calculations and percentile ratings are computed server-side in PostgreSQL stored functions or Netlify Edge Functions rather than trusting client-submitted totals.

---

## K. Netlify Deployment Architecture & Environment Setup

### Environment Variables (.env)
```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJKV1QiLC...
```

### Netlify Configuration (`netlify.toml`)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## L. Implementation Roadmap (Phase 2B & Beyond)

1. **Phase 2B — Database Seeding & Supabase Setup:** Execute SQL migration scripts in Supabase, create storage buckets, and configure RLS policies.
2. **Phase 2C — Authentication Integration:** Wire Supabase Auth (`signUp`, `signInWithPassword`, `signOut`) into Header and Auth Modals.
3. **Phase 2D — Service Layer & Hook Refactoring:** Connect `questionService.ts` and `testService.ts` to Supabase SDK queries.
4. **Phase 2E — Secure Test Evaluation RPC:** Deploy Postgres RPC function for answer grading and attempt score generation.

---

## M. Decisions Requiring Approval

Before proceeding to Phase 2B implementation, please confirm your approval on the following decisions:

1. **Option Normalization Model:** Normalizing options into a `question_options` child table (recommended for scalability and multi-language support) vs. storing options as JSONB inside `questions`.
2. **Answer Exposure Protection Mode:** Implementing the secure RPC mode where `is_correct` is withheld during live exam sessions and evaluated server-side upon submission.
3. **Database Schema Approval:** Approval of the 17 entity tables and role structures (`student`, `question_reviewer`, `admin`, `super_admin`) detailed in Section D.
