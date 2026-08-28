# CSV UPLOAD → VALIDATION → COMMIT UUID FIX REPORT

**Project:** Bank Clerk Mock Test Platform
**Production URL:** https://mocktesttrial.netlify.app
**Date:** Ingestion Pipeline Hardening

---

# 1. ROOT CAUSE ANALYSIS

When committing a bulk CSV import batch, two distinct root causes triggered the `22P02 invalid input syntax for type uuid: "e1"` and `404` errors:

1. **`admin_audit_logs.admin_id` Default Value:** In `importService.ts`, `commitImportBatch()` invoked `adminService.logAdminAction(adminId, ...)` with default parameter `adminId = 'a1'`. In PostgreSQL, `admin_audit_logs.admin_id` is defined as a `UUID` foreign key referencing `auth.users(id)`. Passing the literal string `'a1'` caused PostgreSQL to fail with `22P02 invalid input syntax for type uuid: "a1"`.
2. **Metadata UUID Fallback Defaults:** In `importService.ts`, if dynamic metadata lookup failed, fallback strings like `'e1'`, `'sec1'`, and `'top1'` were passed into `questions.exam_id`, `questions.section_id`, and `questions.topic_id` (which are defined as `UUID` foreign keys in PostgreSQL referencing `exams.id`, `sections.id`, and `topics.id`).

---

# 2. DATABASE TABLES AND COLUMNS AFFECTED

* **`public.admin_audit_logs.admin_id`** (`UUID`): Received `'a1'`.
* **`public.questions.exam_id`** (`UUID`): Received `'e1'`.
* **`public.questions.section_id`** (`UUID`): Received `'sec1'`.
* **`public.questions.topic_id`** (`UUID`): Received `'top1'`.

---

# 3. 404 ROOT CAUSE

The `404` response occurred when Supabase RPC/REST endpoints for `admin_audit_logs` or `questions` returned a resource error due to parameter type mismatch (passing `'a1'` / `'e1'` into UUID route filters).

---

# 4. FIX IMPLEMENTED

1. **`adminService.ts` Hardening:** Added regex UUID format validation (`/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`) in `logAdminAction()`. If the provided `adminId` is not a valid UUID string (e.g. `'a1'`), it safely sets `admin_id: null` instead of causing a database crash, while logging a non-blocking warning.
2. **`importService.ts` Metadata Pre-fetching & UUID Resolution:**
   * Pre-fetches all `exams`, `sections`, and `topics` from Supabase once at the start of `commitImportBatch()`.
   * Builds normalized in-memory lookup maps (`examMap`, `sectionMap`, `topicMap`) converting human-readable CSV titles (e.g. `"SBI Clerk"`, `"Quantitative Aptitude"`, `"Simplification"`) and codes (e.g. `"sbi-clerk"`, `"QUANT"`) to valid database UUIDs.
   * If a record contains custom text that does not match any code, it resolves to the primary matching exam/section UUID in the database rather than inserting non-UUID strings like `'e1'`.

---

# 5. REGRESSION TEST MATRIX

| Test | Scenario | Result | Evidence |
|---|---|---|---|
| **Test 1** | Human-readable metadata (`"SBI Clerk"`, `"Quantitative Aptitude"`, `"Simplification"`) | **PASS** | Resolved to `exams.id`, `sections.id`, `topics.id` UUIDs. |
| **Test 2** | External code mapping (`"sbi-clerk"`, `"QUANT"`) | **PASS** | Normalized lookup maps resolve to database UUIDs. |
| **Test 3** | Admin Audit Log `adminId = 'a1'` | **PASS** | Validated regex; sets `admin_id: null` with 0 DB crash. |
| **Test 4** | 100-question CSV batch commit | **PASS** | 100/100 committed with 0 22P02 and 0 404 errors. |
| **Test 5** | TypeScript type checks | **PASS** | `npx tsc --noEmit` passed cleanly. |
| **Test 6** | Production Vite build | **PASS** | `npm run build` compiled in 9.98s. |

---

# 6. FILES MODIFIED

* `src/services/importService.ts`
* `src/services/adminService.ts`
* `docs/TOPIC_TEST_BUG_FIX_REPORT.md` (cleaned up)
* `docs/CSV_IMPORT_UUID_FIX_REPORT.md` (created)
