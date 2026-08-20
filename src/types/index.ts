export type UserRole = 'guest' | 'student' | 'question_reviewer' | 'admin' | 'super_admin';

export type ExamCategory = 'IBPS Clerk' | 'SBI Clerk' | 'RBI Assistant' | 'RRB Clerk';

export type SubjectSection =
  | 'Quantitative Aptitude'
  | 'Reasoning Ability'
  | 'English Language'
  | 'General & Banking Awareness';

export type DifficultyLevel = 'Easy' | 'Moderate' | 'Hard';

export interface QuestionOption {
  id: string; // e.g. 'A', 'B', 'C', 'D', 'E' or option UUID
  text: string;
  is_correct?: boolean;
}

export interface Question {
  id: string;
  exam: ExamCategory;
  section: SubjectSection;
  topic: string;
  difficulty: DifficultyLevel;
  year?: number;
  questionText: string;
  options: QuestionOption[];
  correctOptionId?: string;
  explanation?: string;
  status?: 'draft' | 'under_review' | 'pending' | 'validated' | 'approved' | 'published' | 'rejected' | 'archived';
  aiConfidence?: number;
  aiSuggestedAnswer?: string;
  sourceAnswer?: string;
  createdAt?: string;
}

/** Secure Question representation sent to client during active test attempt (no correct answers or explanations) */
export interface SecureQuestionOption {
  id: string;
  option_key: string;
  text: string;
}

export interface SecureExamQuestion {
  id: string;
  sectionId: string;
  sectionName: string;
  topicId: string;
  topicTitle: string;
  difficulty: string;
  questionText: string;
  options: SecureQuestionOption[];
}

export interface TopicMeta {
  id: string;
  section: SubjectSection;
  title: string;
  questionCount: number;
  testsCount: number;
  difficulty: DifficultyLevel;
  completionPercent: number;
  lastAttemptDate?: string;
}

export interface TestSectionConfig {
  id: string;
  sectionId: string;
  sectionName: string;
  questionCount: number;
  marksPerQuestion: number;
  negativeMarks: number;
  durationMinutes?: number;
}

export interface MockTestMeta {
  id: string;
  title: string;
  exam: ExamCategory;
  phase: 'prelims' | 'mains';
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  sections: SubjectSection[] | TestSectionConfig[];
  attemptsCount: number;
  isFreeSample?: boolean;
  isPublished?: boolean;
}

export interface UserAnswerState {
  questionId: string;
  selectedOptionId: string | null; // option_id or option_key
  selectedOptionKey?: string | null;
  status: 'answered' | 'not_answered' | 'marked_for_review' | 'not_visited';
  timeSpentSeconds: number;
}

export interface SectionResultData {
  sectionId: string;
  sectionName: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  score: number;
  maxScore: number;
  accuracy: number;
}

export interface TestAttemptResult {
  attemptId: string;
  testId: string;
  testTitle: string;
  exam: ExamCategory;
  dateCompleted: string;
  timeSpentSeconds: number;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  score: number;
  maxScore: number;
  accuracy: number; // percentage
  percentile: number;
  sectionBreakdown: Record<string, SectionResultData>;
  topicBreakdown: Record<string, { total: number; correct: number; accuracy: number }>;
  userAnswers: Record<string, UserAnswerState>;
  questionsWithAnswers?: Question[]; // Revealed post-submission for review
}

export interface TimerState {
  remainingSeconds: number;
  endTimeMs: number;
  isExpired: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinedDate: string;
  testsTaken: number;
  avgAccuracy: number;
  globalRank: number;
  targetExam: ExamCategory;
}

// --- Phase 3E Dashboard & Performance Interfaces ---

export interface DashboardStats {
  totalTestsAttempted: number;
  completedTests: number;
  avgScore: number;
  avgAccuracy: number;
  bestScore: number;
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
}

export interface SectionPerformance {
  sectionName: SubjectSection | string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  score: number;
  accuracy: number;
  performanceLevel: 'High' | 'Good' | 'Needs Improvement' | 'Weak';
}

export interface TopicPerformance {
  topicName: string;
  sectionName: string;
  attemptedQuestions: number;
  correctAnswers: number;
  accuracy: number;
  performanceLevel: 'High' | 'Good' | 'Needs Improvement' | 'Weak';
}

export interface WeakTopic {
  topicName: string;
  sectionName: string;
  accuracy: number;
  questionsAttempted: number;
  performanceLevel: 'Needs Improvement' | 'Weak';
}

export interface PracticeRecommendation {
  id: string;
  topicName: string;
  sectionName: string;
  recommendedQuestionCount: number;
  reason: string;
  actionText: string;
}

export interface ExamProgressSummary {
  exam: ExamCategory;
  testsTaken: number;
  avgScore: number;
  avgAccuracy: number;
  bestScore: number;
}
