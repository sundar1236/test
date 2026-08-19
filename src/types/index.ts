export type UserRole = 'guest' | 'student' | 'admin';

export type ExamCategory = 'IBPS Clerk' | 'SBI Clerk' | 'RBI Assistant' | 'RRB Clerk';

export type SubjectSection =
  | 'Quantitative Aptitude'
  | 'Reasoning Ability'
  | 'English Language'
  | 'General & Banking Awareness';

export type DifficultyLevel = 'Easy' | 'Moderate' | 'Hard';

export interface QuestionOption {
  id: string; // e.g. 'A', 'B', 'C', 'D', 'E'
  text: string;
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
  correctOptionId: string;
  explanation: string;
  status?: 'approved' | 'pending' | 'rejected';
  aiConfidence?: number;
  aiSuggestedAnswer?: string;
  sourceAnswer?: string;
  createdAt?: string;
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

export interface MockTestMeta {
  id: string;
  title: string;
  exam: ExamCategory;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  sections: SubjectSection[];
  attemptsCount: number;
  isFreeSample?: boolean;
}

export interface UserAnswerState {
  questionId: string;
  selectedOptionId: string | null;
  status: 'answered' | 'not_answered' | 'marked_for_review' | 'not_visited';
  timeSpentSeconds: number;
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
  sectionBreakdown: Record<string, { score: number; total: number; correct: number; wrong: number }>;
  topicBreakdown: Record<string, { total: number; correct: number; accuracy: number }>;
  userAnswers: Record<string, UserAnswerState>;
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
