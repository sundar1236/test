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
  phase?: 'prelims' | 'mains';
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
  avgTimePerQuestionSeconds?: number;
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
  avgTimeSeconds?: number;
}

export interface TopicPerformance {
  topicName: string;
  sectionName: string;
  attemptedQuestions: number;
  correctAnswers: number;
  accuracy: number;
  performanceLevel: 'High' | 'Good' | 'Needs Improvement' | 'Weak';
  recentAccuracy?: number;
  avgTimeSeconds?: number;
  masteryStatus?: MasteryStatus;
}

export interface WeakTopic {
  topicName: string;
  sectionName: string;
  accuracy: number;
  questionsAttempted: number;
  performanceLevel: 'Needs Improvement' | 'Weak';
  recommendationReason?: string;
}

export interface PracticeRecommendation {
  id: string;
  topicName: string;
  sectionName: string;
  recommendedQuestionCount: number;
  reason: string;
  actionText: string;
  type: 'weak_topic' | 'low_accuracy_section' | 'speed_improvement' | 'review_incorrect';
}

export interface ExamProgressSummary {
  exam: ExamCategory;
  testsTaken: number;
  avgScore: number;
  avgAccuracy: number;
  bestScore: number;
}

// --- Phase 6 Advanced Analytics & Learning System Interfaces ---

export type MasteryStatus = 'Not Started' | 'Learning' | 'Needs Practice' | 'Improving' | 'Strong';

export interface PerformanceTrendPoint {
  attemptId: string;
  testTitle: string;
  exam: ExamCategory;
  phase: 'prelims' | 'mains';
  dateCompleted: string;
  formattedDate: string;
  score: number;
  maxScore: number;
  accuracy: number;
  percentile: number;
  timeSpentSeconds: number;
}

export interface SectionAnalyticsSummary {
  sectionName: SubjectSection | string;
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  totalScore: number;
  maxScore: number;
  accuracy: number;
  avgTimePerQuestionSeconds: number;
  performanceLevel: 'High' | 'Good' | 'Needs Improvement' | 'Weak';
}

export interface TopicAnalyticsSummary {
  topicName: string;
  sectionName: string;
  attemptedQuestions: number;
  correctAnswers: number;
  overallAccuracy: number;
  recentAccuracy: number; // Weighted last 3 attempts
  avgTimePerQuestionSeconds: number;
  masteryStatus: MasteryStatus;
  sampleSizeValid: boolean; // Minimum 5 questions attempted
}

export interface TimeAnalyticsSummary {
  avgTimePerQuestionSeconds: number;
  overallTotalTimeSeconds: number;
  fastestQuestionSeconds: number;
  slowestQuestionSeconds: number;
  sectionAvgTimeSeconds: Record<string, number>;
  timeEfficiencyLevel: 'Optimal' | 'Acceptable' | 'Needs Improvement' | 'Slow';
  recommendation: string;
}

export interface AttemptComparison {
  attemptA: TestAttemptResult;
  attemptB: TestAttemptResult;
  scoreDiff: number;
  accuracyDiff: number;
  correctDiff: number;
  wrongDiff: number;
  timeSpentDiffSeconds: number;
  percentileDiff: number;
  isImprovement: boolean;
}

export interface PracticeSet {
  id: string;
  title: string;
  description: string;
  type: 'incorrect_questions' | 'weak_topics' | 'section_drill' | 'custom';
  examFilter?: ExamCategory;
  sectionFilter?: SubjectSection;
  topicFilter?: string;
  questions: Question[];
  createdAt: string;
}

export interface PerformanceInsight {
  id: string;
  type: 'improvement' | 'warning' | 'speed' | 'strength';
  message: string;
  metricLabel: string;
  metricValue: string;
  derivedFromDate: string;
}
