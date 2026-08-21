# Progress Tracking & Topic Mastery

Progress tracking compiles user attempt history into section and topic mastery levels.

## Models
- `SectionPerformance`: Total questions, attempted, correct, incorrect, score, accuracy, and `performanceLevel` (`High`, `Good`, `Needs Improvement`, `Weak`).
- `TopicPerformance`: Topic name, section, attempted questions, correct count, accuracy %, and `performanceLevel`.
- `ExamProgressSummary`: Aggregated stats per exam series (SBI Clerk, IBPS Clerk, RBI Assistant, RRB Clerk).
