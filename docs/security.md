# Production Security & Hardening Architecture

## 1. Exam Simulator Integrity & Payload Sanitization

To ensure students cannot inspect developer tools or network payloads to view answer keys, the exam service (`src/services/attemptService.ts`) executes strict payload sanitization before sending questions to active test sessions:

* **Stripped Fields during Active Exams:**
  * `is_correct` / `correctOptionId`
  * `explanation`
  * `solution_text`
  * Marks / Score subtotals
* **Authoritative Scoring:** Scores are calculated post-submission on the server or via trusted memory state using server-validated answer keys.
* **Locked Attempts:** Completed attempts cannot be edited or re-submitted.

---

## 2. Timer Resilience & Server Bounds

* Timers compute remaining duration using absolute epoch timestamps (`endTime = startTime + durationMinutes * 60 * 1000`).
* Adjusting client system clocks or switching browser tabs does not alter the absolute end boundary.
* Auto-submission fires automatically when `Date.now() >= endTime`.

---

## 3. Database Access & Row Level Security (RLS)

All sensitive Supabase tables enforce strict Row Level Security policies:

| Table | SELECT Policy | INSERT / UPDATE Policy |
|---|---|---|
| `questions` | Published questions accessible to all authenticated users; Drafts restricted to Admins/Reviewers | Restricted to Admin / Reviewer roles |
| `test_attempts` | Isolated to `user_id = auth.uid()` | Restricted to `user_id = auth.uid()` |
| `attempt_answers` | Isolated to active attempt owner | Isolated to active attempt owner |
| `bookmarks` | Isolated to `user_id = auth.uid()` | Isolated to `user_id = auth.uid()` |

---

## 4. Frontend Security & XSS Mitigation

* All rendered question content, option texts, and solution explanations use React's default text escaping to prevent XSS.
* `dangerouslySetInnerHTML` is avoided across all components.
* External links enforce `rel="noopener noreferrer"`.
* Debug statements and sensitive console logs are stripped in production builds.
