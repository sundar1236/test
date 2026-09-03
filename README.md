# Bank Clerk Mock Test Platform

A full-stack, production-grade competitive exam preparation web application designed for banking recruitment examinations in India. The platform provides students with authentic exam simulators, topic-level practice quizzes, instant score evaluations, and granular analytics while empowering administrators with bulk question ingestion, AI quality validation, duplicate detection, and rule-based mock test publishing.

### Supported Examinations

- **SBI Clerk** (State Bank of India Junior Associate)
- **IBPS Clerk** (Institute of Banking Personnel Selection Clerk)
- **RBI Assistant** (Reserve Bank of India Assistant)
- **RRB Clerk** (Regional Rural Banks Office Assistant)

---

## Project Overview

The **Bank Clerk Mock Test Platform** mimics real-world computer-based examination systems (such as TCS iON exam interfaces) to prepare candidates for national banking entrance tests.

### Target Audience
- **Aspirants / Students**: Preparing for preliminary and main banking recruitment examinations.
- **Content Operations & Reviewers**: Content creators responsible for question drafting, proofreading, and quality validation.
- **Administrators**: System managers overseeing question bank growth, exam publishing rules, user access, and design tokens.

### End-to-End Workflows

#### 1. Student Workflow
```text
Register / Login
       │
       ▼
Select Target Exam (e.g., SBI Clerk)
       │
       ├────────────────────────┬────────────────────────┐
       ▼                        ▼                        ▼
Full Mock Tests           Topic Tests              Practice Mode
(Timed / Sectional)      (Subject Quizzes)        (Untimed / Immediate Feedback)
       │                        │                        │
       └────────────────────────┼────────────────────────┘
                                ▼
                       Exam Simulator Engine
                                │
                                ▼
                      Instant Auto-Scoring
               (+1.0 Correct, -0.25 Incorrect)
                                │
                                ▼
                   Performance & Analytics Dashboard
                 (Accuracy, Sectional Percentile)
```

#### 2. Administrator Workflow
```text
Bulk Import Questions (CSV / JSON)
       │
       ▼
Dry-Run Validation Pipeline
(Structural + Math + Duplicate Check)
       │
       ▼
Staging Queue (Pending Validation / Draft)
       │
       ▼
Admin Review & Quality Approval
       │
       ▼
Publish Question to Active Pool
       │
       ▼
Exam Builder Pool Validation Rule Check
(Sufficient Questions per Section)
       │
       ▼
Publish Live Mock Test Version
```

---

## Technology Stack

| Technology | Version / Spec | Purpose | Implementation Location |
| :--- | :--- | :--- | :--- |
| **React** | 18.3.1 | UI Component Library | `src/` |
| **TypeScript** | 7.0.2 | Type Safety & Static Analysis | `src/types/` |
| **Vite** | 5.4.0 | Build Tooling & Development Server | `vite.config.js` |
| **Supabase Client** | 2.112.3 | Database Client & Authentication SDK | `src/lib/supabase.ts` |
| **PostgreSQL** | 15+ (Supabase) | Relational Database Engine | `supabase/migrations/` |
| **Tailwind CSS** | 4.3.3 | Utility-first Design System Styling | `src/index.css` |
| **React Router** | 6.26.0 | Client-side Single Page App Routing | `src/AppRoutes.tsx` |
| **Recharts** | 3.10.1 | Analytics & Performance Data Charts | `src/pages/PerformanceAnalytics.tsx` |
| **Lucide React** | 1.32.0 | Application Icon System | `src/components/` |
| **Framer Motion** | 11.3.24 | Smooth UI Transitions & Animations | `src/components/` |
| **Netlify** | SPA Engine | Web Application Hosting & Edge Routing | `netlify.toml` |

---

## Application Architecture

```text
                               ┌──────────────────────────────────────────┐
                               │             User Browser                 │
                               └────────────────────┬─────────────────────┘
                                                    │
                                                    ▼
                               ┌──────────────────────────────────────────┐
                               │            React SPA App                 │
                               │        (React Router v6 Routes)          │
                               └──────────┬────────────────────┬──────────┘
                                          │                    │
                                          ▼                    ▼
                               ┌────────────────────┐ ┌───────────────────┐
                               │  AppContext State  │ │  Design Context   │
                               │ (User Role & Auth) │ │  (CSS Variables)  │
                               └──────────┬─────────┘ └───────────────────┘
                                          │
                                          ▼
                               ┌──────────────────────────────────────────┐
                               │           Application Services           │
                               │  (authService, attemptService,           │
                               │   importService, questionService)        │
                               └────────────────────┬─────────────────────┘
                                                    │
                                                    ▼
                               ┌──────────────────────────────────────────┐
                               │           Supabase JS Client             │
                               │         (src/lib/supabase.ts)            │
                               └──────────┬────────────────────┬──────────┘
                                          │                    │
                                          ▼                    ▼
                               ┌────────────────────┐ ┌───────────────────┐
                               │   Supabase Auth    │ │ PostgreSQL DB     │
                               │   (JWT Sessions)   │ │ (RLS Enforced)    │
                               └────────────────────┘ └───────────────────┘
```

### Architectural Highlights

- **Frontend Architecture**: Built using functional React 18 components, custom hooks (`useExamTimer`), and Context providers (`AppContext`, `DesignContext`).
- **Routing**: Client-side SPA routing via `React Router v6` with explicit authentication and role-based route guards in `AppRoutes.tsx`.
- **Service Layer**: Business logic resides in modular services inside `src/services/` (`attemptService`, `importService`, `adminExamBuilderService`, `aiValidationEngine`).
- **State Management**: Centralized React context (`AppContext`) tracks session security, user role, active target exam, and global loading states. Local state (`useState`, `useReducer`) manages screen-specific interactions.
- **Database Communication**: Asynchronous API calls via `@supabase/supabase-js`. Resilient offline/local storage caching fallback (`bankclerk_active_attempt_*`) ensures attempt state persistence during transient network drops.
- **Authentication & RBAC**: Supabase Auth handles email/password credentials and password reset flows, joined with the `public.profiles` database table for role lookup (`guest`, `student`, `question_reviewer`, `admin`, `super_admin`).

---

## Repository Structure

```text
.
├── .env.example                                # Environment variable reference template
├── .gitignore                                  # Git exclusion rules
├── index.html                                  # SPA HTML root entry point
├── netlify.toml                                # Netlify build & SPA rewrite configuration
├── package.json                                # Node dependencies and NPM scripts
├── README.md                                   # Platform documentation
├── tsconfig.json                               # TypeScript compiler configuration
├── vite.config.js                              # Vite build bundler configuration
├── docs/                                       # Engineering and architecture audit reports
│   ├── CSV_IMPORT_UUID_FIX_REPORT.md
│   └── PHASE_12_CONTENT_EXPANSION_AND_ENGINE_HARDENING_REPORT.md
├── seed/                                       # Seed JSON files for metadata and question pools
│   ├── exams.json
│   ├── sample_questions.json
│   ├── sections.json
│   └── topics.json
├── src/                                        # Application source code
│   ├── App.tsx                                 # Root application component wrapper
│   ├── AppRoutes.tsx                           # Global routing configuration & guards
│   ├── main.tsx                                # DOM root mounting file
│   ├── vite-env.d.ts                           # Vite environment type declarations
│   ├── assets/                                 # Static CSS stylesheets and images
│   ├── components/                             # Reusable React UI components
│   │   ├── Header.tsx                          # Student/Guest top navigation bar
│   │   ├── MainLayout.tsx                      # Primary App layout container with sidebar
│   │   ├── QuestionReviewModal.tsx             # Modal for question validation review
│   │   ├── Sidebar.tsx                         # Navigation sidebar
│   │   ├── admin/                              # Admin feature components
│   │   │   ├── AdminExamBuilder.tsx            # Rule-based exam editor
│   │   │   └── import/                         # Bulk ingestion components
│   │   │       ├── CSVImport.tsx               # CSV upload & preview UI
│   │   │       ├── DuplicateReview.tsx         # Staged duplicate review UI
│   │   │       ├── ImportDashboard.tsx         # Import overview hub
│   │   │       ├── ImportHistory.tsx           # Audit history of batch imports
│   │   │       └── JSONImport.tsx              # JSON array import UI
│   │   └── ui/                                 # UI widgets (slider, back to top, cursor)
│   ├── context/                                # React Context Providers
│   │   ├── AppContext.tsx                      # Global auth, user role, target exam state
│   │   └── DesignContext.tsx                   # Dynamic CSS theme tokens provider
│   ├── data/                                   # Seed mock data and fallback pools
│   │   └── mockData.ts
│   ├── hooks/                                  # Custom React hooks
│   │   └── useExamTimer.ts                     # Absolute Unix timestamp exam timer hook
│   ├── lib/                                    # Infrastructure libraries
│   │   └── supabase.ts                         # Centralized Supabase SDK client initialization
│   ├── pages/                                  # Application screens and view routes
│   │   ├── AdminDashboard.tsx                  # Admin metrics overview
│   │   ├── AdminDesignSettings.tsx             # Design tokens and theme settings editor
│   │   ├── AttemptHistory.tsx                  # Student test attempt history list
│   │   ├── AuditLogScreen.tsx                  # Admin system audit trail log viewer
│   │   ├── BookmarkScreen.tsx                  # Student saved/bookmarked questions
│   │   ├── CategoryManagement.tsx              # Exam, section, topic hierarchy manager
│   │   ├── DesignSystemDoc.tsx                 # Internal UI design system guide (Admin)
│   │   ├── ExamSimulatorScreen.tsx             # Full exam simulator interface
│   │   ├── ForgotPassword.tsx                  # Password reset request screen
│   │   ├── LandingPage.tsx                     # Public landing page
│   │   ├── Login.tsx                           # User sign in screen
│   │   ├── MockTestList.tsx                    # Student mock test catalog screen
│   │   ├── PerformanceAnalytics.tsx            # Student analytics & chart dashboard
│   │   ├── PracticeModeScreen.tsx              # Untimed step-by-step practice quiz screen
│   │   ├── ProfileScreen.tsx                   # Student account profile & target exam manager
│   │   ├── QuestionBank.tsx                    # Student browser for published questions
│   │   ├── QuestionManagement.tsx              # Admin question bank editor
│   │   ├── Register.tsx                        # Account creation screen
│   │   ├── ResultScreen.tsx                    # Detailed attempt result report card
│   │   ├── StudentDashboard.tsx                # Student home dashboard
│   │   ├── TopicTests.tsx                      # Subject topic quiz selector screen
│   │   └── ValidationQueue.tsx                 # Admin pending question validation queue
│   ├── services/                               # Service layer modules
│   │   ├── adminExamBuilderService.ts          # Exam draft saving, pool check, & publish rules
│   │   ├── adminService.ts                     # Audit logging and administrative tools
│   │   ├── aiValidationEngine.ts               # Quality scoring & structural validation
│   │   ├── analyticsEngine.ts                  # Student score & accuracy analytics compiler
│   │   ├── attemptService.ts                   # Attempt lifecycle, answer caching, scoring
│   │   ├── authService.ts                      # Supabase Auth login, register, profile RPC
│   │   ├── bookmarkService.ts                  # User question bookmark operations
│   │   ├── bulkActionService.ts                # Question bulk status update tools
│   │   ├── designConfigService.ts              # CSS design token persistence
│   │   ├── duplicateDetectionService.ts        # Question similarity & hash checker
│   │   ├── examService.ts                      # Exam catalog fetcher
│   │   ├── importService.ts                    # CSV/JSON batch parser and dry-run previewer
│   │   ├── practiceService.ts                  # Practice session state engine
│   │   ├── progressService.ts                  # User topic accuracy updater
│   │   ├── questionService.ts                  # Question CRUD operations
│   │   ├── testService.ts                      # Mock test listing and availability checks
│   │   └── topicService.ts                     # Topic hierarchy operations
│   ├── types/                                  # TypeScript interface declarations
│   │   ├── database.ts                         # PostgreSQL database entity types
│   │   ├── designConfig.ts                     # Design token configuration types
│   │   └── index.ts                            # Platform-wide domain models
│   └── utlits/                                 # Data formatting utilities & helpers
├── supabase/                                   # Database migrations and seed scripts
│   ├── seed.sql                                # Initial default metadata seed script
│   ├── seed_admin.sql                          # Default admin account SQL snippet
│   ├── seed_admin_and_student.sql              # Combined seed script
│   ├── setup_complete_database.sql             # Complete database schema setup script
│   └── migrations/                             # Sequential SQL schema migrations
│       ├── 20240101000000_initial_schema.sql
│       ├── 20240101000001_rls_policies.sql
│       ├── 20240101000002_import_and_duplicates.sql
│       ├── 20240101000003_delete_account_rpc.sql
│       ├── 20240101000004_exam_builder_and_randomization.sql
│       ├── 20240101000005_design_configuration_system.sql
│       ├── 20240101000006_master_sync_and_timing_mode.sql
│       ├── 20240101000007_target_exam_foreign_key_hardening.sql
│       └── 20240101000008_question_bank_performance_indexes.sql
└── tests/                                      # E2E & Automation test scripts
    └── responsive.spec.ts                      # Playwright responsive viewport layout test
```

---

## Authentication & Authorization

Authentication is managed via **Supabase Auth** (`authService.ts`) with user profile state synced to `public.profiles`.

### Registration & Login
- **Email Normalization**: Standardizes email input (`trim().toLowerCase()`) during registration and login to prevent duplicate accounts.
- **Profile Synchronization**: Upon user registration, a record is inserted into `public.profiles` referencing `auth.users(id)` via foreign key constraint.
- **Target Exam Preference**: New users choose a primary target exam (e.g. `SBI Clerk`), persisted in `profiles.target_exam_id`.
- **Password Recovery**: Handled via `authService.resetPasswordForEmail()`, navigating to `/forgot-password`. Dynamic origin resolution (`getAuthRedirectUrl()`) ensures password reset redirect URLs match production (`https://mocktesttrial.netlify.app`) or local development origins.

### User Roles & Access Hierarchy

1. **`guest`**: Unauthenticated public visitor. Access restricted to Landing Page (`/`), Login (`/login`), Register (`/register`), and Forgot Password (`/forgot-password`).
2. **`student`**: Default authenticated user role. Granted access to Dashboard, Mock Test Catalog, Exam Simulator, Topic Quizzes, Practice Mode, Bookmarks, Attempt History, Performance Analytics, and Profile Settings.
3. **`question_reviewer`**: Content management role. Granted access to Question Management, Staging Validation Queue, and Duplicate Review queues.
4. **`admin` / `super_admin`**: Administrative role. Granted full system access including Exam Builder, Bulk Imports, Category Management, Audit Logs, and Design System Settings (`/admin/settings/design`).

### Route Protection

Route guards are implemented centrally in `src/AppRoutes.tsx`:

```tsx
const isAdminOrReviewer = role === 'admin' || role === 'super_admin' || role === 'question_reviewer';
const isAuthenticated = role !== 'guest';
```

Unauthorized attempts to access protected student or admin routes trigger an automatic redirection to `/login` or `/dashboard`.

---

## Student Features

### 1. Dashboard (`/dashboard`)
- **File**: `src/pages/StudentDashboard.tsx`
- **Behavior**: Displays target exam progress, recent mock test scores, accuracy trends, upcoming test schedule, quick test shortcuts, and topic mastery breakdown.

### 2. Target Exam Manager
- **File**: `src/pages/ProfileScreen.tsx` & `src/context/AppContext.tsx`
- **Behavior**: Allows students to switch active target exam preference (e.g., SBI Clerk to IBPS Clerk). Persisted in `profiles.target_exam_id` and automatically filters mock tests and practice content across views.

### 3. Mock Test Catalog (`/mock-tests`)
- **File**: `src/pages/MockTestList.tsx`
- **Behavior**: Catalog of full-length prelims and mains mock exams filtered by the active target exam. Shows duration, question count, total marks, free sample badge, and previous attempt history.

### 4. Topic Tests (`/topics`)
- **File**: `src/pages/TopicTests.tsx`
- **Behavior**: Sectional topic quiz browser. Enables students to take focused quizzes on specific topics (e.g., *Data Interpretation*, *Syllogism*, *Reading Comprehension*). Launches via route `/topic-test/:examId/:sectionId/:topicId`.

### 5. Practice Mode (`/practice`)
- **File**: `src/pages/PracticeModeScreen.tsx`
- **Behavior**: Untimed practice interface providing immediate option feedback, step-by-step mathematical explanations, bookmark toggles, and topic filters without affecting formal mock test attempt scores.

### 6. Exam Simulator (`/mock-test/:testId` or `/exam/:testId`)
- **File**: `src/pages/ExamSimulatorScreen.tsx`
- **Behavior**: TCS iON-style full exam interface featuring full-screen mode, sectional timer, section tab switching, question status palette, answer response state tracking (Answered, Marked for Review, Not Answered), and explicit submit modal.

### 7. Question Palette & Navigation
- **Behavior**: Live visual status grid:
  - **Gray**: Not Visited
  - **Red**: Not Answered
  - **Green**: Answered
  - **Purple**: Marked for Review
  - **Purple with Green Dot**: Answered & Marked for Review

### 8. Absolute Unix Timestamp Timer
- **Hook**: `src/hooks/useExamTimer.ts`
- **Behavior**: Computes deadline as `startTime + durationInMs`. Resilient against browser tab throttling, page refreshes, and window minimize events. Triggers automatic exam submission upon expiration.

### 9. Bookmarks (`/bookmarks`)
- **File**: `src/pages/BookmarkScreen.tsx` & `src/services/bookmarkService.ts`
- **Behavior**: Allows students to save complex or missed questions for later offline or online review.

### 10. Results & Detailed Report Card (`/results/:attemptId`)
- **File**: `src/pages/ResultScreen.tsx`
- **Behavior**: Detailed score breakdown showing final raw score, percentile estimate, accuracy percentage, time spent per section, correct/incorrect response key, and detailed solution explanations.

### 11. Performance Analytics (`/performance`)
- **File**: `src/pages/PerformanceAnalytics.tsx`
- **Behavior**: Visual Recharts analytics tracking historical score progression, subject accuracy distribution, time management velocity, and weak area topic recommendations.

### 12. Attempt History (`/attempts`)
- **File**: `src/pages/AttemptHistory.tsx`
- **Behavior**: Comprehensive historical archive of all completed mock test attempts with score comparisons and direct re-entry to attempt report cards.

---

## Exam Engine

The exam engine (`attemptService.ts`, `adminExamBuilderService.ts`, `ExamSimulatorScreen.tsx`) controls test generation, attempt snapshot persistence, response tracking, and auto-scoring.

### Question & Option Randomization
When an attempt is initialized in `attemptService.startAttempt()`:
1. Questions are fetched based on section selection rules.
2. Questions are shuffled using the **Fisher-Yates algorithm**.
3. Option keys (`A`, `B`, `C`, `D`, `E`) are randomized per student attempt.
4. **Question & Option Snapshotting**: The randomized order of questions and options is persisted to the `attempt_questions` table (`option_order_snapshot` JSONB column). This guarantees that if a student reloads or resumes an active test, their specific question sequence and choice options remain consistent.

### Timed vs. Untimed Behavior
- **`time_based`**: Counts down from the allotted exam time. Triggers automatic submission when the timer reaches zero.
- **`non_time_based`**: Untimed practice mode without countdown enforcement, allowing self-paced learning.

### Local Answer Caching & Recovery
To survive unexpected network loss or accidental browser closures, active user selections are cached immediately to `localStorage` under key `bankclerk_active_attempt_<testId>_<userId>` and synchronized asynchronously to `attempt_answers`.

---

## Question Bank System

Questions pass through a controlled lifecycle from ingestion to pool availability:

```text
CSV / JSON File
       │
       ▼
Import Service (`importService.ts`)
       │
       ▼
Structural & Quality Validation (`aiValidationEngine.ts`)
(Length >= 12 chars, 4+ options, option uniqueness, math checks)
       │
       ▼
Duplicate Detection (`duplicateDetectionService.ts`)
(Normalized text hashing & SHA-256 similarity checks)
       │
       ▼
Pending Validation Queue (`ValidationQueue.tsx`)
(Staged as `draft` or `under_review`)
       │
       ▼
Admin / Reviewer Proofreading (`QuestionReviewModal.tsx`)
       │
       ▼
Status set to `published`
       │
       ▼
Available in Active Question Pool for Mock Tests
```

---

## CSV Import Documentation

Administrators can bulk-import question sets via `/admin/import/csv`.

### Supported CSV Columns

| Column Name | Required | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `question` (or `question_text`) | **Yes** | `If 12 men can complete a work in 18 days...` | Statement text (minimum 10 chars) |
| `option_a` (or `option a`) | **Yes** | `15 days` | Option choice A |
| `option_b` (or `option b`) | **Yes** | `20 days` | Option choice B |
| `option_c` (or `option c`) | **Yes** | `24 days` | Option choice C |
| `option_d` (or `option d`) | **Yes** | `18 days` | Option choice D |
| `option_e` (or `option e`) | Optional | `30 days` | Option choice E |
| `correct_answer` (or `answer`) | **Yes** | `C` | Correct choice letter (`A`, `B`, `C`, `D`, `E`) |
| `explanation` (or `solution`) | Recommended | `Work done by 1 man in 1 day = 1 / (12 * 18)...` | Step-by-step solution |
| `exam` (or `exam_code`) | **Yes** | `SBI Clerk` or `sbi-clerk` | Target exam title or code |
| `section` (or `section_name`)| **Yes** | `Quantitative Aptitude` | Exam subject section |
| `topic` (or `topic_title`) | **Yes** | `Time and Work` | Subject topic |
| `difficulty` | Optional | `easy`, `moderate`, or `hard` | Question difficulty level (default: `moderate`) |
| `phase` | Optional | `prelims` or `mains` | Exam phase (default: `prelims`) |
| `source` | Optional | `SBI Clerk 2023 Memory Based` | Origin reference |
| `year` | Optional | `2023` | Source year |

### CSV Formatting Rules
1. **Encoding**: Must be UTF-8 encoded.
2. **Quoting**: Enclose fields containing commas, quotes, or newlines in double quotes (`"..."`).
3. **Chunked Processing**: Imports process in batches of 100 rows to ensure UI responsiveness.
4. **Metadata Lookup Resolution**: `importService.ts` automatically maps string headers (e.g., "SBI Clerk", "Quantitative Aptitude") to database relational UUIDs in `exams`, `sections`, and `topics`.
5. **Default Status**: Imported questions are safely created in `draft` status, preventing unreviewed questions from appearing in live exams.
6. **Error Export**: Invalid rows generate an exportable error log CSV for offline correction.

---

## Database Schema & Tables

The platform uses a relational PostgreSQL schema managed via Supabase migrations (`supabase/migrations/`).

```text
  +------------------+         +-------------------+         +---------------------+
  |      exams       |<--------|     questions     |-------->|      sections       |
  +------------------+         +---------+---------+         +---------------------+
                                         |                              ^
                                         |                              |
                                         v                              |
                               +-------------------+         +----------+----------+
                               |  question_options |         |       topics        |
                               +-------------------+         +---------------------+
                                         ^
                                         |
                                         |
  +------------------+         +---------+---------+         +---------------------+
  |   test_attempts  |<--------|  attempt_answers  |         |     bookmarks       |
  +------------------+         +-------------------+         +---------------------+
```

### Table Reference

| Table Name | Purpose | Primary Key | Key Foreign Keys |
| :--- | :--- | :--- | :--- |
| `profiles` | User profiles and RBAC roles | `id` | `auth.users(id)` |
| `exams` | Entrance examination types | `id` | None |
| `sections` | Standard exam sections (Quant, Reasoning, etc.) | `id` | None |
| `topics` | Granular subject topics | `id` | `section_id` -> `sections(id)`, `parent_topic_id` -> `topics(id)` |
| `question_sources` | Question metadata origins | `id` | None |
| `questions` | Unified question bank repository | `id` | `exam_id` -> `exams(id)`, `section_id` -> `sections(id)`, `topic_id` -> `topics(id)` |
| `question_options` | Normalized option choices | `id` | `question_id` -> `questions(id)` |
| `question_validations` | Validation review history | `id` | `question_id` -> `questions(id)`, `reviewer_id` -> `profiles(id)` |
| `mock_tests` | Created mock test papers | `id` | `exam_id` -> `exams(id)` |
| `mock_test_sections` | Section rule configurations for mock tests | `id` | `mock_test_id` -> `mock_tests(id)`, `section_id` -> `sections(id)` |
| `mock_test_questions` | Explicit question-to-test mapping | `(mock_test_id, question_id)` | `mock_test_id`, `question_id` |
| `test_attempts` | Student test attempt instances | `id` | `user_id` -> `profiles(id)`, `mock_test_id` -> `mock_tests(id)` |
| `attempt_questions` | Question and option order attempt snapshots | `id` | `attempt_id` -> `test_attempts(id)`, `question_id` -> `questions(id)` |
| `attempt_answers` | Student response state per question | `id` | `attempt_id` -> `test_attempts(id)`, `question_id` -> `questions(id)` |
| `bookmarks` | Saved questions per student | `id` | `user_id` -> `profiles(id)`, `question_id` -> `questions(id)` |
| `user_topic_progress` | Aggregated topic performance metrics | `(user_id, topic_id)` | `user_id` -> `profiles(id)`, `topic_id` -> `topics(id)` |
| `admin_audit_logs` | Administrative audit trail | `id` | `admin_id` -> `profiles(id)` |
| `design_system_config` | Dynamic CSS design token configurations | `id` | `updated_by` -> `profiles(id)` |

---

## Row Level Security (RLS)

Row Level Security is enabled across PostgreSQL tables in `20240101000001_rls_policies.sql`:

- **Profiles**: Users can only `SELECT` and `UPDATE` their own profile record (`auth.uid() = id`).
- **Questions**: Students can only `SELECT` questions with status `'published'`. Administrators and reviewers can `SELECT`, `INSERT`, `UPDATE`, and `DELETE` all questions.
- **Question Options**: Readable if the associated question is accessible to the user.
- **Test Attempts & Attempt Answers**: Strictly isolated to the owning student (`auth.uid() = user_id`). Users cannot read or modify another student's test attempt records.
- **Bookmarks**: Users can manage (`ALL`) only their own bookmark records (`auth.uid() = user_id`).
- **Admin Audit Logs**: Restricted exclusively to users with `admin` or `super_admin` role.

---

## Security Architecture

1. **Active Exam Answer-Key Sanitization**: During active exam attempts (`attemptService.startAttempt`), correct option flags (`is_correct`), solution explanations, and scoring parameters are stripped from student payload responses until final test submission.
2. **RPC Account Deletion**: Account deletion (`authService.deleteAccount`) invokes a custom `SECURITY DEFINER` PostgreSQL RPC function (`delete_user_account()`) in `20240101000003_delete_account_rpc.sql` that safely purges user-owned records without compromising global exam or question integrity.
3. **Environment Secret Protection**: Public client keys (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are exposed safely via Vite environment variables. Service-role administrative keys are never included in frontend client bundles.

---

## Scoring System

Scoring follows standard Indian banking examination rules (`attemptService.submitAttempt`):

$$\text{Raw Score} = (\text{Correct Answers} \times 1.0) - (\text{Incorrect Answers} \times 0.25) + (\text{Unanswered} \times 0.0)$$

- **Correct Response**: `+1.0` mark
- **Incorrect Response**: `-0.25` mark (Negative marking penalty)
- **Unanswered / Skipped**: `0.0` mark
- **Accuracy Percentage**: $\frac{\text{Correct Answers}}{\text{Attempted Questions}} \times 100$
- **Sectional Score**: Computed independently per section with negative marking penalties applied.

---

## Practice Mode vs. Exam Simulator

| Feature | Practice Mode (`/practice`) | Exam Simulator (`/mock-test/:testId`) |
| :--- | :--- | :--- |
| **Purpose** | Self-paced learning and topic drills | Authentic exam condition rehearsal |
| **Feedback Loop** | Immediate answer reveal upon choice selection | Concealed until test submission |
| **Explanations** | Step-by-step solution shown immediately | Displayed only on final Result Screen |
| **Timer** | Untimed | Countdown timer with auto-submit |
| **Question Palette** | Basic list view | TCS iON 5-state response palette |
| **Impact on History** | Does not alter official mock attempt scores | Persisted to Attempt History & Analytics |

---

## Admin Panel

Accessible to users with `admin`, `super_admin`, or `question_reviewer` role:

- **Admin Dashboard (`/admin/dashboard`)**: Platform overview showing total questions, published tests, active students, and pending queue count.
- **Exam Builder (`/admin/exam-builder`)**: Interface to define question selection rules per section, set time limits, set timing mode, configure negative marking, and publish tests.
- **Pool Shortage Checks**: `adminExamBuilderService.validatePoolAvailability()` checks if sufficient published questions exist in each section before allowing test publication.
- **Question Bank Manager (`/admin/questions`)**: Filterable data table to edit, delete, preview, or change question statuses.
- **Validation Queue (`/admin/validation`)**: Review queue for unverified or AI-ingested questions.
- **Bulk Import Hub (`/admin/import`)**: Ingestion tool for CSV and JSON question files with dry-run previews and duplicate detection.
- **Duplicate Review (`/admin/import/duplicates`)**: Interface to compare staged questions against existing items and choose resolution (`skip`, `overwrite`, or `import_anyway`).
- **Category Management (`/admin/categories`)**: Hierarchy manager for Exams, Sections, and Topics.
- **Audit Logs (`/admin/analytics`)**: Log viewer tracking administrative actions, batch import commits, and test publications.
- **Design Settings (`/admin/settings/design`)**: Centralized UI configuration for CSS variables (primary blue, secondary colors, font sizes, border radii).

---

## Route Table

| Route Path | Access Level | Screen / Component | Purpose |
| :--- | :--- | :--- | :--- |
| `/` | Public | `LandingPage` | Platform overview and landing page |
| `/login` | Public | `Login` | Student/Admin sign in screen |
| `/register` | Public | `Register` | New student account registration |
| `/forgot-password` | Public | `ForgotPassword` | Password reset request |
| `/dashboard` | Student | `StudentDashboard` | Primary student dashboard |
| `/questions` | Student | `QuestionBank` | Browse published questions |
| `/topics` | Student | `TopicTests` | Topic-wise test selection |
| `/mock-tests` | Student | `MockTestList` | Mock test catalog |
| `/mock-test/:testId` | Student | `ExamSimulatorScreen` | Timed full exam simulator |
| `/exam/:testId` | Student | `ExamSimulatorScreen` | Exam simulator route alias |
| `/topic-test/:examId/:sectionId/:topicId` | Student | `ExamSimulatorScreen` | Topic quiz simulator |
| `/results/:attemptId` | Student | `ResultScreen` | Exam attempt report card |
| `/attempts` | Student | `AttemptHistory` | Historical attempt list |
| `/performance` | Student | `PerformanceAnalytics` | Analytics & chart view |
| `/practice` | Student | `PracticeModeScreen` | Untimed step-by-step practice |
| `/bookmarks` | Student | `BookmarkScreen` | Bookmarked questions viewer |
| `/profile` | Student | `ProfileScreen` | User profile & target exam manager |
| `/design-system` | Admin / Reviewer | `DesignSystemDoc` | Internal design system guide |
| `/admin/dashboard` | Admin / Reviewer | `AdminDashboard` | Admin operational overview |
| `/admin/settings/design` | Admin / Reviewer | `AdminDesignSettings` | CSS theme tokens editor |
| `/admin/exam-builder` | Admin / Reviewer | `AdminExamBuilder` | Create new mock test |
| `/admin/exam-builder/:examId` | Admin / Reviewer | `AdminExamBuilder` | Edit existing mock test |
| `/admin/questions` | Admin / Reviewer | `QuestionManagement` | Question bank CRUD |
| `/admin/categories` | Admin / Reviewer | `CategoryManagement` | Exam/Section/Topic hierarchy editor |
| `/admin/validation` | Admin / Reviewer | `ValidationQueue` | Staging validation queue |
| `/admin/analytics` | Admin / Reviewer | `AuditLogScreen` | Admin audit log viewer |
| `/admin/import` | Admin / Reviewer | `ImportDashboard` | Bulk import hub |
| `/admin/import/csv` | Admin / Reviewer | `CSVImport` | CSV bulk upload |
| `/admin/import/json` | Admin / Reviewer | `JSONImport` | JSON array bulk upload |
| `/admin/import/history` | Admin / Reviewer | `ImportHistory` | Past batch import audit log |
| `/admin/import/duplicates` | Admin / Reviewer | `DuplicateReview` | Duplicate question review queue |

---

## Environment Variables

Configure environment variables in a `.env` file in the root directory:

```env
# Centralized Supabase Endpoint URL
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co

# Supabase Publishable / Anonymous Public Key
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

- **Local Development**: Place variables in `.env`.
- **Netlify / Production**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` under Netlify Site Configuration -> Environment Variables.

---

## Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **NPM**: v9.0.0 or higher

### Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-org/bank-clerk-mock-test.git
   cd bank-clerk-mock-test
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your local or production Supabase credentials
   ```

4. **Start Vite Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

5. **Preview Production Build**:
   ```bash
   npm run build
   npm run preview
   ```

---

## Production Build

To compile the application for production deployment:

```bash
npm run build
```

Vite bundle output will be generated in the `dist/` directory:
- `dist/index.html`
- `dist/assets/index-*.css`
- `dist/assets/index-*.js`

---

## Netlify Deployment

The repository includes a root `netlify.toml` configuration:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Deployment Steps
1. Connect the repository to Netlify.
2. Set Build Command to `npm run build` and Publish Directory to `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Netlify Environment Variables.
4. Deploy site. SPA routing for deep URLs (e.g. `/mock-tests`, `/dashboard`) is handled automatically via single-page redirects.

---

## Testing & Verification

| Test Type | Verification Method | Command / File | Status |
| :--- | :--- | :--- | :--- |
| **TypeScript Type Checks** | Static Type Checking | `npm run build` | 🔍 VERIFIED |
| **Production Build Check** | Vite Build Bundler | `npm run build` | 🔍 VERIFIED |
| **E2E Layout Verification** | Playwright Responsive Test | `tests/responsive.spec.ts` | 🔍 VERIFIED |
| **AI Math & Rule Validation** | Engine Unit Logic | `src/services/aiValidationEngine.ts` | 🔍 VERIFIED |
| **Duplicate Detection** | Hash & String Similarity Logic | `src/services/duplicateDetectionService.ts` | 🔍 VERIFIED |

---

## Content Management

### Pool Shortage Diagnostics
When publishing an exam, `adminExamBuilderService.validatePoolAvailability()` checks the available count of published questions against the required question count per section. If a shortage is detected, publishing is blocked with an explicit error:

```text
Insufficient questions for section 'Quantitative Aptitude'. Required: 35, Available: 20, Shortage: 15.
```

This ensures students never encounter incomplete or broken mock test attempts.

---

## Known Limitations & Technical Debt

| Severity | Issue | Location | Impact | Recommended Fix |
| :--- | :--- | :--- | :--- | :--- |
| **MEDIUM** | Legacy Portfolio JSX Template Artifacts | `src/components/sections/`, `src/pages/home.jsx` | Unused legacy template files raise ESLint warnings during `npm run lint`. | Remove legacy non-banking template files or refine `eslint.config.js` exclude patterns. |
| **LOW** | Client-side Attempt Score Calculation | `src/services/attemptService.ts` | In offline or local fallback mode, answer evaluation occurs on the client. | Shift final attempt answer key comparison to a Supabase PostgreSQL RPC function. |
| **LOW** | Storage Quota in Local Storage Cache | `attemptService.ts` | Storing multiple attempt state snapshots in `localStorage` could hit browser storage limits over time. | Implement automated pruning for local attempt caches older than 7 days. |

---

## Current Project Status

| Subsystem | Status | Verification Summary |
| :--- | :--- | :--- |
| **Frontend UI & Components** | ✅ VERIFIED | All screens, responsive cards, modals, and design tokens verified. |
| **Authentication & RBAC** | ✅ VERIFIED | Supabase Auth, email normalization, profile sync, and route guards verified. |
| **Student Dashboard & Analytics**| ✅ VERIFIED | Target exam preference, history, and Recharts analytics verified. |
| **Exam Engine & Randomization**| ✅ VERIFIED | Fisher-Yates shuffle, option snapshotting, and timer verified. |
| **Scoring Engine** | ✅ VERIFIED | +1.0 / -0.25 scoring, section breakdown, and accuracy verified. |
| **Bulk CSV / JSON Ingestion** | ✅ VERIFIED | Parsing, metadata UUID resolution, dry-run preview, and batch commit verified. |
| **AI Validation & Duplicate Check**| ✅ VERIFIED | Quality scoring, math checks, and SHA-256 duplicate detection verified. |
| **Database & Migrations** | ✅ VERIFIED | 9 SQL migrations, schemas, indexes, and RLS policies verified. |
| **Production Build** | ✅ VERIFIED | `npm run build` succeeds cleanly with Vite bundle outputs. |

---

## Future Roadmap

1. **PostgreSQL RPC Answer Evaluation**: Move final score evaluation entirely into a server-side PostgreSQL function to prevent any potential client-side answer key inspection.
2. **Offline Web Worker Sync**: Enhance active attempt local storage fallback with Background Sync Web Workers for seamless sync on reconnection.
3. **Proctored Window Focus Tracking**: Add tab switch and window blur tracking during active exam simulator attempts to record integrity metrics.
4. **Exportable PDF Report Cards**: Allow students to download official scorecards and solution keys in PDF format.

---

## Contribution Guidelines

1. **Branch Naming**: Use descriptive branch names (`feature/exam-timer-fix`, `fix/csv-import-uuid`).
2. **Coding Standards**: Write modular TypeScript code adhering to React functional component standards.
3. **Database Migrations**: Place all schema additions in timestamped SQL files inside `supabase/migrations/`.
4. **Pre-Commit Checks**: Ensure `npm run build` passes without errors before submitting pull requests.

---

## License

No project license is currently specified.
