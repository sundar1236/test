# Mock Test Engine Architecture

The Mock Test Engine provides a realistic, high-concurrency exam simulation environment tailored for banking clerk examinations (SBI Clerk, IBPS Clerk, RBI Assistant, RRB Clerk).

## Core Capabilities
- **Strict Published Filtering:** Only questions with `status = 'published'` are eligible for inclusion in user test papers.
- **Fixed Question Paper Mapping:** Once an attempt is created, the question paper (`attempt_id -> question_id`) is immutably bound for the life of that attempt.
- **Answer Key Security:** Active exam questions strip correct answers, explanations, and AI metrics.
- **Absolute Timestamp Timing:** Uses `endTime = startTime + durationMinutes` to prevent client clock manipulation or refresh abuses.
- **Resilient Offline Queue:** Local state synchronization queues answers during network blips and retries automatically.
- **Server/Trusted Score Calculation:** Final scores and negative marking are calculated using trusted question keys.

## Component Overview
- `src/pages/ExamSimulatorScreen.tsx`: Modern distraction-free exam simulation interface with Question Viewer, Section Navigation, Options Selector, Save & Next, Mark for Review, and Question Palette.
- `src/services/attemptService.ts`: Attempt lifecycle management, question generation, answer caching, and score computation.
- `src/hooks/useExamTimer.ts`: Timestamp-based countdown timer hook.
- `src/components/QuestionReviewModal.tsx`: Post-submission detailed question and explanation review modal.
- `src/pages/AttemptHistory.tsx`: Historical attempt scorecard lookup and review repository.
