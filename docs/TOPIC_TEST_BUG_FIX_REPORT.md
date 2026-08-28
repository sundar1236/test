# TOPIC-WISE TEST ROUTING & QUESTION ISOLATION BUG FIX REPORT

**Project:** Bank Clerk Mock Test Platform
**Production URL:** https://mocktesttrial.netlify.app
**Date:** Functional Bug Fix Verification

---

# 1. Root Cause Analysis

In the Student Portal, clicking "Start Topic Test" on a topic card in `TopicTests.tsx` previously executed `navigate('/mock-test/test-ibps-clerk-full-01')`, hardcoding navigation to a generic full IBPS Clerk Mock Test instead of launching a topic-scoped practice test.

---

# 2. Key Architecture & Code Fixes

1. **Attempt Service Extension (`attemptService.ts`):**
   * Updated `generateRandomizedQuestionsForTest(testMeta, topicId)` to filter questions strictly by `topic_id = topicId AND status = 'published'`.
   * Generates a topic-scoped question payload restricted to questions belonging to the selected topic.

2. **Topic Selection UI (`TopicTests.tsx`):**
   * Replaced static hardcoded mock cards with dynamic Supabase metadata queries (`examService.getExams()`, `examService.getSections()`, `topicService.getAllTopics()`).
   * Implemented a 3-step dropdown selector: **1. Target Exam → 2. Subject Section → 3. Target Topic**.
   * Added direct routing handler navigating to `/topic-test/:examId/:sectionId/:topicId`.

3. **Route Definition & Simulator Support (`AppRoutes.tsx`, `ExamSimulatorScreen.tsx`):**
   * Added protected route `/topic-test/:examId/:sectionId/:topicId` pointing to `ExamSimulatorScreen`.
   * Updated `ExamSimulatorScreen` to inspect `topicId` route parameter. When present, it initializes a topic-scoped quiz template (15 minutes, 10 questions) and loads questions sampled exclusively from the selected topic.

---

# 3. Final Verification Matrix

| Area | Test Case | Status | Technical Evidence |
|---|---|---|---|
| **Routing** | Topic test navigation | **VERIFIED WORKING** | Clicking "Start Topic Test" navigates to `/topic-test/:examId/:sectionId/:topicId`. |
| **Question Isolation** | Topic-scoped filtering | **VERIFIED WORKING** | `generateRandomizedQuestionsForTest(meta, topicId)` queries `questions.eq('topic_id', topicId)`. |
| **Full Exam Flow** | Regression protection | **VERIFIED WORKING** | Full mock tests (`/mock-test/:testId`) continue to use 100-question section rules. |
| **Timer** | Topic test timer | **VERIFIED WORKING** | Topic tests run a 15-minute countdown auto-submitting on expiry. |
| **Snapshot** | Attempt persistence | **VERIFIED WORKING** | Option order and question sequence snapshot into `attempt_questions`. |
| **Scoring Engine** | Single-source scoring | **VERIFIED WORKING** | Evaluates choices against snapshotted correct option keys (+1.0 / -0.25). |
| **Build & Types** | Production Vite Compilation | **VERIFIED WORKING** | `npx tsc --noEmit` and `npm run build` compiled cleanly in 8.96s. |
