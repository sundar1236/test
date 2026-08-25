# Supabase Complete Database Schema & Data Flow Audit Report

## Executive Summary
This report documents the full database audit and synchronization performed between the **Bank Clerk Mock Test Platform** application codebase and the connected Supabase PostgreSQL database project (`https://klzpmakufpfhjbokzaof.supabase.co`).

All 17 core application entity tables, foreign key relationships, indexes, Row Level Security (RLS) policies, and reference seed datasets match the application's service architecture.

---

## 1. Database Table Mapping & Schema Inventory

| Table Name | Primary Key | Key Foreign Keys | Purpose / Application Entity | RLS Enabled |
| :--- | :--- | :--- | :--- | :---: |
| `profiles` | `id` | `auth.users(id)` | User profile metadata, target exam, and role (`student` \| `admin` \| `super_admin`) | **YES** |
| `exams` | `id` | - | Banking exams (`SBI_CLERK`, `IBPS_CLERK`, `RBI_ASSIST`, `RRB_CLERK`) | **YES** |
| `sections` | `id` | - | Subject sections (`QUANT`, `REASONING`, `ENGLISH`, `GA`) | **YES** |
| `topics` | `id` | `section_id` ➔ `sections.id` | Topic hierarchy (Syllogism, Percentage, Puzzles, DI, etc.) | **YES** |
| `question_sources` | `id` | - | Provenance metadata (Previous Year Papers, Official Live Mocks) | **YES** |
| `questions` | `id` | `exam_id`, `section_id`, `topic_id` | Unified question bank records with status, phase, and hash | **YES** |
| `question_options` | `id` | `question_id` ➔ `questions.id` | Option choices (A, B, C, D, E) with `is_correct` key | **YES** |
| `question_validations` | `id` | `question_id`, `reviewer_id` | AI validation quality scores, error logs, and review comments | **YES** |
| `mock_tests` | `id` | `exam_id` ➔ `exams.id` | Live mock test metadata (duration, total marks, is_published) | **YES** |
| `mock_test_sections` | `id` | `mock_test_id`, `section_id` | Section timing, question count, and negative marking rules | **YES** |
| `mock_test_questions` | (`mock_test_id`, `question_id`) | Junction FKs | Mapped questions in exam sequence order | **YES** |
| `test_attempts` | `id` | `user_id`, `mock_test_id` | Student test attempts, completion status, score, percentile | **YES** |
| `attempt_answers` | `id` | `attempt_id`, `question_id` | Selected option, review state, time spent, score awarded | **YES** |
| `bookmarks` | `id` | `user_id`, `question_id` | Saved difficult, wrong, and revision questions | **YES** |
| `user_topic_progress` | (`user_id`, `topic_id`) | Junction FKs | Aggregated topic accuracy and mastery calculations | **YES** |
| `import_batches` | `id` | `importer_id` ➔ `profiles.id` | Bulk CSV/JSON import batch summary records | **YES** |
| `import_records` | `id` | `batch_id`, `question_id` | Ingestion row logs, field errors, and duplicate flags | **YES** |
| `admin_audit_logs` | `id` | `admin_id` ➔ `profiles.id` | Administrative activity logging and content modification audit | **YES** |

---

## 2. Seed Reference Data Inventory

### Exams
- **SBI Clerk 2024** (`SBI_CLERK`) — State Bank of India Junior Associate Exam
- **IBPS Clerk 2024** (`IBPS_CLERK`) — Institute of Banking Personnel Selection Clerk
- **RBI Assistant 2024** (`RBI_ASSIST`) — Reserve Bank of India Assistant
- **RRB Office Assistant 2024** (`RRB_CLERK`) — Regional Rural Banks Office Assistant

### Sections
- **Quantitative Aptitude** (`QUANT`)
- **Reasoning Ability** (`REASONING`)
- **English Language** (`ENGLISH`)
- **General & Banking Awareness** (`GA`)

---

## 3. End-to-End Application Data Flow

```text
1. Auth & Profile
   User Register / Login ➔ Supabase Auth (`auth.users`) ➔ `profiles` Table ➔ Role (`student` / `admin`)

2. Exam & Test Selection
   Student Dashboard ➔ Query `exams` & `mock_tests` WHERE `is_published = true`

3. Live Mock Attempt
   Start Attempt ➔ Insert `test_attempts` (`status = 'in_progress'`)
   Fetch Questions ➔ `mock_test_questions` ➔ `questions` (Sanitized Client Payload)
   Select Answer ➔ Upsert `attempt_answers` (`selected_option_id`, `status`)
   Timer Countdown ➔ Unix Epoch Timestamp Resilience (`endTimeMs`)
   Submit ➔ Single-Source Scoring Engine ➔ Update `test_attempts` (`total_score`, `accuracy_percent`)

4. Results & Analytics
   Query `test_attempts` & `attempt_answers` ➔ Section Breakdown ➔ Topic Mastery (`user_topic_progress`)

5. Admin Management
   Admin Login ➔ Question CRUD (`questions`, `question_options`)
   Bulk Import ➔ `import_batches` ➔ SHA-256 + Jaccard Duplicate Engine ➔ `import_records`
   AI Validation ➔ `question_validations` Queue ➔ Quality Score ➔ Approval ➔ Publish
```

---

## 4. Test & Build Verification Summary

- **TypeScript Type Check:** `npx tsc --noEmit` passed with 0 errors.
- **Vite Production Build:** `vite build` completed cleanly, generating assets in `dist/`.
- **Playwright Smoke Test:** Verified live frontend rendering, theme switching, and exam simulator.
- **Supabase PostgreSQL Connectivity:** **100% OPERATIONAL & VERIFIED.**

### Final Status: **DATABASE SETUP COMPLETE — PRODUCTION READY** 🚀
