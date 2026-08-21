# Service Layer Documentation

The platform uses a clean 4-tier service architecture preventing direct database calls inside React UI components:

`UI Components -> Custom Hooks / Context -> Service Layer -> Supabase Client -> PostgreSQL`

---

## Service Modules (`src/services/`)

### 1. `authService.ts`
* `signUp(email, pass, fullName, role)`
* `signIn(email, pass)`
* `signOut()`
* `getSession()`
* `getCurrentProfile(userId)`

### 2. `examService.ts`
* `getExams()`: Fetches active banking exam series (`SBI_CLERK`, `IBPS_CLERK`, etc.).
* `getSections()`: Fetches standard subject sections (`QUANT`, `REASONING`, `ENGLISH`, `GA`).

### 3. `topicService.ts`
* `getTopicsBySection(sectionId)`
* `getAllTopics()`

### 4. `questionService.ts`
* `getPublishedQuestions(filters)`
* `createQuestion(payload)`
* `updateQuestionStatus(questionId, status)`

### 5. `testService.ts`
* `getPublishedTests()`
* `getTestWithQuestions(testId)`

### 6. `attemptService.ts`
* `submitAttempt(payload)`
* `getUserAttempts(userId)`

### 7. `bookmarkService.ts`
* `getUserBookmarks(userId)`
* `addBookmark(userId, questionId)`
* `removeBookmark(userId, questionId)`

### 8. `progressService.ts`
* `getUserProgress(userId)`
* `updateUserTopicProgress(userId, topicId, attempted, correct)`

### 9. `adminService.ts`
* `getValidationQueue()`
* `getAuditLogs()`
* `logAdminAction(adminId, action, targetEntity, targetId, details)`
