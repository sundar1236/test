import { supabase } from '../lib/supabase';
import { Question } from '../types';
import { mockQuestions } from '../data/mockData';

const BOOKMARKS_LOCAL_KEY = 'bank_app_bookmarks';

export const bookmarkService = {
  /**
   * Fetch bookmarked question IDs for a user with DB & local storage sync
   */
  async getBookmarkedQuestionIds(userId: string = 'usr-student-1'): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('question_id')
        .eq('user_id', userId);

      if (!error && data) {
        const ids = data.map((b) => b.question_id);
        localStorage.setItem(BOOKMARKS_LOCAL_KEY, JSON.stringify(ids));
        return ids;
      }
    } catch {
      // Fallback
    }

    const saved = localStorage.getItem(BOOKMARKS_LOCAL_KEY);
    return saved ? JSON.parse(saved) : ['q-quant-02', 'q-reason-01'];
  },

  /**
   * Toggle bookmark status for a question
   */
  async toggleBookmark(questionId: string, userId: string = 'usr-student-1'): Promise<string[]> {
    const currentIds = await this.getBookmarkedQuestionIds(userId);
    const isBookmarked = currentIds.includes(questionId);

    let updatedIds: string[];
    if (isBookmarked) {
      updatedIds = currentIds.filter((id) => id !== questionId);
      try {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('question_id', questionId);
      } catch {
        // Fallback
      }
    } else {
      updatedIds = [...currentIds, questionId];
      try {
        await supabase.from('bookmarks').insert({
          user_id: userId,
          question_id: questionId,
        });
      } catch {
        // Fallback
      }
    }

    localStorage.setItem(BOOKMARKS_LOCAL_KEY, JSON.stringify(updatedIds));
    return updatedIds;
  },

  /**
   * Get full question models for bookmarked IDs with optional filter parameters
   */
  async getBookmarkedQuestions(
    userId: string = 'usr-student-1',
    filters?: { exam?: string; section?: string; topic?: string }
  ): Promise<Question[]> {
    const ids = await this.getBookmarkedQuestionIds(userId);
    if (ids.length === 0) return [];

    let questions: Question[] = [];

    // Try DB fetch
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*, question_options(id, option_key, option_text), sections(name), topics(title), exams(title)')
        .in('id', ids);

      if (!error && data && data.length > 0) {
        questions = data.map((item: any) => ({
          id: item.id,
          exam: item.exams?.title || 'SBI Clerk',
          section: item.sections?.name || 'Quantitative Aptitude',
          topic: item.topics?.title || 'General',
          difficulty: item.difficulty || 'Moderate',
          questionText: item.question_text,
          options: (item.question_options || []).map((o: any) => ({
            id: o.id,
            text: o.option_text,
          })),
          correctOptionId: 'A',
          explanation: item.explanation || '',
          status: item.status,
        }));
      }
    } catch {
      // Fallback
    }

    if (questions.length === 0) {
      questions = mockQuestions.filter((q) => ids.includes(q.id));
    }

    // Apply filtering
    if (filters) {
      if (filters.exam && filters.exam !== 'All') {
        questions = questions.filter((q) => q.exam === filters.exam);
      }
      if (filters.section && filters.section !== 'All') {
        questions = questions.filter((q) => q.section === filters.section);
      }
      if (filters.topic && filters.topic !== 'All') {
        questions = questions.filter((q) => q.topic.toLowerCase().includes(filters.topic!.toLowerCase()));
      }
    }

    return questions;
  },
};
