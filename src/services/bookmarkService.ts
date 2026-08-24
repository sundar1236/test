import { supabase } from '../lib/supabase';
import { Question } from '../types';

const BOOKMARKS_LOCAL_PREFIX = 'bank_app_bookmarks_';

export const bookmarkService = {
  /**
   * Fetch bookmarked question IDs for the authenticated user
   */
  async getBookmarkedQuestionIds(userId: string): Promise<string[]> {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('question_id')
        .eq('user_id', userId);

      if (!error && data) {
        const ids = data.map((b) => b.question_id);
        localStorage.setItem(`${BOOKMARKS_LOCAL_PREFIX}${userId}`, JSON.stringify(ids));
        return ids;
      }
    } catch {
      // Fallback
    }

    const saved = localStorage.getItem(`${BOOKMARKS_LOCAL_PREFIX}${userId}`);
    return saved ? JSON.parse(saved) : [];
  },

  /**
   * Toggle bookmark status for a question owned by the authenticated user
   */
  async toggleBookmark(questionId: string, userId: string): Promise<string[]> {
    if (!userId) return [];

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

    localStorage.setItem(`${BOOKMARKS_LOCAL_PREFIX}${userId}`, JSON.stringify(updatedIds));
    return updatedIds;
  },

  /**
   * Get full question models for bookmarked IDs with optional filter parameters
   */
  async getBookmarkedQuestions(
    userId: string,
    filters?: { exam?: string; section?: string; topic?: string }
  ): Promise<Question[]> {
    if (!userId) return [];

    const ids = await this.getBookmarkedQuestionIds(userId);
    if (ids.length === 0) return [];

    let questions: Question[] = [];

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
      // Return empty array on connection fallback for clean student state
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
