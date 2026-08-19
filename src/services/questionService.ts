import { supabase } from '../lib/supabase';
import { QuestionStatus, DifficultyLevel, ExamPhase } from '../types/database';

export interface CreateQuestionPayload {
  exam_id: string;
  section_id: string;
  topic_id: string;
  question_text: string;
  difficulty: DifficultyLevel;
  explanation?: string;
  phase?: ExamPhase;
  options: { option_key: string; option_text: string; is_correct: boolean }[];
}

export const questionService = {
  async getPublishedQuestions(filters?: { examId?: string; sectionId?: string; difficulty?: string }) {
    let query = supabase
      .from('questions')
      .select('*, question_options(*), exams(title), sections(name), topics(title)')
      .eq('status', 'published');

    if (filters?.examId) query = query.eq('exam_id', filters.examId);
    if (filters?.sectionId) query = query.eq('section_id', filters.sectionId);
    if (filters?.difficulty) query = query.eq('difficulty', filters.difficulty as DifficultyLevel);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createQuestion(payload: CreateQuestionPayload) {
    const { options, ...qData } = payload;
    const { data: qResult, error: qError } = await supabase
      .from('questions')
      .insert({ ...qData, status: 'draft' })
      .select()
      .single();

    if (qError) throw qError;

    const formattedOpts = options.map((opt) => ({
      ...opt,
      question_id: qResult.id,
    }));

    const { error: optError } = await supabase.from('question_options').insert(formattedOpts);
    if (optError) throw optError;

    return qResult;
  },

  async updateQuestionStatus(questionId: string, status: QuestionStatus) {
    const { data, error } = await supabase
      .from('questions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
