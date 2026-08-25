import { supabase } from '../lib/supabase';
import { QuestionStatus, DifficultyLevel, ExamPhase } from '../types/database';

export interface CreateQuestionPayload {
  exam_id: string;
  section_id: string;
  topic_id: string;
  source_id?: string;
  question_text: string;
  question_hash?: string;
  normalized_text?: string;
  difficulty: DifficultyLevel;
  explanation?: string;
  phase?: ExamPhase;
  status?: QuestionStatus;
  created_by?: string;
  options: { option_key: string; option_text: string; is_correct: boolean }[];
}

export interface QuestionFilters {
  examId?: string;
  phase?: string;
  sectionId?: string;
  topicId?: string;
  difficulty?: string;
  status?: string;
  sourceId?: string;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'recently_updated' | 'status';
  page?: number;
  pageSize?: number;
}

export interface ValidationCheckResult {
  isValid: boolean;
  errors: string[];
}

export const questionService = {
  /**
   * Strictly validates question integrity before persisting to database or publishing.
   */
  validateQuestionPayload(payload: CreateQuestionPayload): ValidationCheckResult {
    const errors: string[] = [];

    if (!payload.question_text || payload.question_text.trim().length < 10) {
      errors.push('Question text is missing or shorter than 10 characters.');
    }

    if (!payload.options || payload.options.length < 4) {
      errors.push('Question must have at least 4 answer choices.');
    } else {
      const emptyOptions = payload.options.filter((o) => !o.option_text || o.option_text.trim().length === 0);
      if (emptyOptions.length > 0) {
        errors.push(`${emptyOptions.length} option choice(s) contain empty text.`);
      }

      const correctOptions = payload.options.filter((o) => o.is_correct);
      if (correctOptions.length === 0) {
        errors.push('No answer option is marked as correct.');
      } else if (correctOptions.length > 1) {
        errors.push('Multiple answer options are marked as correct. Bank Clerk exams require exactly one correct key.');
      }
    }

    if (!payload.exam_id) errors.push('Exam mapping is required.');
    if (!payload.section_id) errors.push('Subject section mapping is required.');
    if (!payload.topic_id) errors.push('Topic classification is required.');

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  async getAllQuestions() {
    const { data, error } = await supabase
      .from('questions')
      .select('*, question_options(*), exams(title, code), sections(name, code), topics(title), question_sources(name)')
      .order('created_at', { ascending: false });

    if (error) return { data: [], count: 0 };
    return { data: data || [], count: data ? data.length : 0 };
  },

  async getQuestions(filters?: QuestionFilters) {
    let query = supabase
      .from('questions')
      .select('*, question_options(*), exams(title, code), sections(name, code), topics(title), question_sources(name)', { count: 'exact' });

    if (filters?.examId && filters.examId !== 'All') query = query.eq('exam_id', filters.examId);
    if (filters?.phase && filters.phase !== 'All') query = query.eq('phase', filters.phase as ExamPhase);
    if (filters?.sectionId && filters.sectionId !== 'All') query = query.eq('section_id', filters.sectionId);
    if (filters?.topicId && filters.topicId !== 'All') query = query.eq('topic_id', filters.topicId);
    if (filters?.difficulty && filters.difficulty !== 'All') query = query.eq('difficulty', filters.difficulty as DifficultyLevel);
    if (filters?.status && filters.status !== 'All') query = query.eq('status', filters.status as QuestionStatus);
    if (filters?.sourceId && filters.sourceId !== 'All') query = query.eq('source_id', filters.sourceId);

    if (filters?.search) {
      query = query.ilike('question_text', `%${filters.search}%`);
    }

    // Sorting
    if (filters?.sortBy === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else if (filters?.sortBy === 'recently_updated') {
      query = query.order('updated_at', { ascending: false });
    } else if (filters?.sortBy === 'status') {
      query = query.order('status', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count: count || 0, page, pageSize };
  },

  async createQuestion(payload: CreateQuestionPayload) {
    const validation = this.validateQuestionPayload(payload);
    if (!validation.isValid) {
      throw new Error(`Validation Error: ${validation.errors.join(' ')}`);
    }

    const { options, ...qData } = payload;
    const { data: qResult, error: qError } = await supabase
      .from('questions')
      .insert({ ...qData, status: payload.status || 'draft' })
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

  async updateQuestion(questionId: string, payload: Partial<CreateQuestionPayload>) {
    const { options, ...qData } = payload;

    if (Object.keys(qData).length > 0) {
      const { error: qError } = await supabase
        .from('questions')
        .update({ ...qData, updated_at: new Date().toISOString() })
        .eq('id', questionId);

      if (qError) throw qError;
    }

    if (options && options.length > 0) {
      await supabase.from('question_options').delete().eq('question_id', questionId);
      const formattedOpts = options.map((opt) => ({
        ...opt,
        question_id: questionId,
      }));
      await supabase.from('question_options').insert(formattedOpts);
    }

    const { data, error } = await supabase
      .from('questions')
      .select('*, question_options(*)')
      .eq('id', questionId)
      .single();

    if (error) throw error;
    return data;
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
