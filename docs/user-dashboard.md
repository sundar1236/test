# User Dashboard Architecture

The Student Dashboard provides a central command center for bank exam aspirants.

## Key KPI Metrics
- **Tests Attempted:** Total mock tests started/completed.
- **Average Score & Best Score:** Aggregated across attempt history.
- **Average Accuracy (%):** Ratio of total correct choices to total questions attempted.
- **Bookmarked Questions:** Quick count with direct deep link to review repository.

## Components & Sections
1. **Target Exam Header:** Highlights target exam (e.g. SBI Clerk) and global aspirant rank.
2. **Empty State Handling:** Displays an inviting onboarding card when zero attempts exist (`testAttempts.length === 0`).
3. **Recent Activity Feed:** Lists latest 3 completed attempts with quick scorecard links.
4. **Exam-Wise Breakdown:** Sectional score & accuracy averages grouped by SBI Clerk, IBPS Clerk, RBI Assistant, and RRB Clerk.
5. **Weak Topics & Practice Recommendations:** Highlights weak topics (< 70% accuracy with >= 3 Qs) and suggests targeted practice sets.
