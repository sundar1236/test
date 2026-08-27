# PHASE 5 — PRODUCTION QUESTION INGESTION, VALIDATION & POOL SCALING REPORT

**Project:** Bank Clerk Mock Test Platform
**Production URL:** https://mocktesttrial.netlify.app
**Database:** Supabase PostgreSQL
**Audit Date:** Phase 5 Bulk Ingestion & Content QA Audit

---

# 1. Executive Summary

This Phase 5 report details the architecture, validation queue, duplicate detection pipeline, bulk CSV/JSON ingestion pipeline, section pool diagnostics, and production content status for the Bank Clerk Mock Test Platform.

---

# 2. Production Database Question Breakdown

### Production Database Audit (Actual Counts)

| Status | Total Count |
|---|---|
| **Published / Usable** | 18 |
| **Pending Validation** | 2 |
| **Draft** | 0 |
| **Rejected / Archived** | 0 |
| **Duplicate / Potential Duplicate** | 0 |
| **TOTAL DATABASE QUESTIONS** | **20** |

---

# 3. Content Pool Dashboard & Section Shortages

### Section-Wise Production Pool Status

| Exam | Section | Published Count | Pending | Duplicate | Required Target | Shortage | Pool Status |
|---|---|---:|---:|---:|---:|---:|---|
| **SBI Clerk** | Quantitative Aptitude | 2 | 0 | 0 | 35 | **33** | `SHORTAGE — UNPUBLISHABLE` |
| **SBI Clerk** | Reasoning Ability | 2 | 1 | 0 | 35 | **33** | `SHORTAGE — UNPUBLISHABLE` |
| **SBI Clerk** | English Language | 1 | 0 | 0 | 30 | **29** | `SHORTAGE — UNPUBLISHABLE` |
| **SBI Clerk** | General Awareness | 1 | 0 | 0 | 25 | **24** | `SHORTAGE — UNPUBLISHABLE` |
| **IBPS Clerk** | Quantitative Aptitude | 2 | 1 | 0 | 35 | **33** | `SHORTAGE — UNPUBLISHABLE` |
| **IBPS Clerk** | Reasoning Ability | 1 | 0 | 0 | 35 | **34** | `SHORTAGE — UNPUBLISHABLE` |
| **IBPS Clerk** | English Language | 1 | 0 | 0 | 30 | **29** | `SHORTAGE — UNPUBLISHABLE` |
| **RBI Assistant** | Quantitative Aptitude | 1 | 0 | 0 | 35 | **34** | `SHORTAGE — UNPUBLISHABLE` |
| **RBI Assistant** | Reasoning Ability | 1 | 0 | 0 | 35 | **34** | `SHORTAGE — UNPUBLISHABLE` |
| **RBI Assistant** | English Language | 1 | 0 | 0 | 30 | **29** | `SHORTAGE — UNPUBLISHABLE` |
| **RBI Assistant** | General Awareness | 1 | 0 | 0 | 25 | **24** | `SHORTAGE — UNPUBLISHABLE` |
| **RRB Clerk** | Quantitative Aptitude | 2 | 0 | 0 | 40 | **38** | `SHORTAGE — UNPUBLISHABLE` |
| **RRB Clerk** | Reasoning Ability | 1 | 0 | 0 | 40 | **39** | `SHORTAGE — UNPUBLISHABLE` |
| **RRB Clerk** | General Awareness | 1 | 0 | 0 | 20 | **19** | `SHORTAGE — UNPUBLISHABLE` |
| **TOTALS** | **All Sections** | **18 Usable** | **2** | **0** | **4,000 Target** | **3,982** | **CONTENT INGESTION REQUIRED** |

*Note: As instructed, artificial or low-quality filler questions have NOT been fabricated merely to meet target numbers. Bulk ingestion of real verified question sets is required.*

---

# 4. Ingestion Pipeline & Duplicate Detection Architecture

* **Staging Workflow:** `RAW IMPORT` → `NORMALIZATION` → `STRUCTURAL VALIDATION` → `ANSWER CHECK` → `DUPLICATE DETECTION` → `ADMIN REVIEW` → `APPROVAL` → `PUBLISHED`.
* **Staging Default:** All imported questions default to `pending_validation` or `draft` status.
* **Duplicate Detection:** `duplicateDetectionService.ts` computes SHA-256 normalized question statement hashes and Jaccard similarity scores, classifying items as `UNIQUE`, `EXACT_DUPLICATE`, or `POTENTIAL_DUPLICATE`.
* **Historical Attempt Snapshot Protection:** `attempt_questions` snapshots question and option sequences upon attempt start; question updates or status changes do not modify completed or active attempt scorecards.

---

# 5. Final Classification Table

| Area | Feature / Requirement | Classification | Evidence / Source Verification |
|---|---|---|---|
| Import Pipeline | CSV & JSON bulk ingestion with preview | **VERIFIED — PRODUCTION** | Implemented in `importService.ts`, `CSVImport.tsx`, `JSONImport.tsx`. |
| Import Pipeline | CSV Template download | **VERIFIED — PRODUCTION** | Admin template download provided in `CSVImport.tsx`. |
| Validation Queue | Admin review & single-answer validation | **VERIFIED — PRODUCTION** | `ValidationQueue.tsx` and `QuestionManagement.tsx` handle single-answer checks and approval. |
| Duplicate Detection | SHA-256 & Jaccard similarity checks | **VERIFIED — CODE ONLY** | `duplicateDetectionService.ts` computes exact and near duplicate scores. |
| Pool Validation | Per-section pool shortage diagnostics | **VERIFIED — PRODUCTION** | `adminExamBuilderService.ts` blocks publishing tests when section pools are insufficient. |
| Attempt Snapshot | Immutable historical scorecard protection | **VERIFIED — PRODUCTION** | `attempt_questions` snapshots preserve original option order regardless of admin edits. |
| Scoring Engine | +1.0 / -0.25 negative marking | **VERIFIED — PRODUCTION** | Evaluates answers against snapshotted correct choices. |
| RLS Security | Student vs Admin permission isolation | **VERIFIED — DATABASE** | RLS policies restrict students to published questions and own attempts. |
| Content Gap | 4,000 Target Question Pool | **CONTENT GAP** | Production database contains 18 published questions. **CONTENT INGESTION REQUIRED.** |
| Build & Types | Production Vite & TypeScript | **VERIFIED — PRODUCTION** | `npx tsc --noEmit` and `npm run build` compiled with 0 errors in 8.50s. |
