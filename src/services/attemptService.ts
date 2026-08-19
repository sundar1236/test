import { supabase } from '../lib/supabase';
import { AttemptStatus } from '../types/database';

export interface SubmitAttemptPayload {
  userId: string;
  testId: string;
  timeSpentSeconds: number;
  totalScore: number;
  maxScore: number;
  accuracyPercent: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  answers: {
    questionId: string;
    selectedOptionId: string | null;
    status: string;
    timeSpentSeconds: number;
  }[];
}

export const attemptService = {
  async submitAttempt(payload: SubmitAttemptPayload) {
    const { answers, ...attemptData } = payload;

    const { data: attempt, error: attemptErr } = await supabase
      .from('test_attempts')
      .insert({
        user_id: attemptData.userId,
        mock_test_id: attemptData.testId,
        status: 'completed' as AttemptStatus,
        time_spent_seconds: attemptData.timeSpentSeconds,
        total_score: attemptData.totalScore,
        max_score: attemptData.maxScore,
        accuracy_percent: attemptData.accuracyPercent,
        attempted_count: attemptData.attemptedCount,
        correct_count: attemptData.correctCount,
        incorrect_count: attemptData.incorrectCount,
        skipped_count: attemptData.skippedCount,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (attemptErr) throw attemptErr;

    const formattedAnswers = answers.map((ans) => ({
      attempt_id: attempt.id,
      question_id: ans.questionId,
      selected_option_id: ans.selectedOptionId,
      status: ans.status,
      time_spent_seconds: ans.timeSpentSeconds,
    }));

    const { error: ansErr } = await supabase.from('attempt_answers').insert(formattedAnswers);
    if (ansErr) throw ansErr;

    return attempt;
  },

  async getUserAttempts(userId: string) {
    const { data, error } = await supabase
      .from('test_attempts')
      .select('*, mock_tests(title, exams(code))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
