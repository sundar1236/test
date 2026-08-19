import { supabase } from '../lib/supabase';

export const bookmarkService = {
  async getUserBookmarks(userId: string) {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*, questions(*, question_options(*))')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async addBookmark(userId: string, questionId: string) {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({ user_id: userId, question_id: questionId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeBookmark(userId: string, questionId: string) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .match({ user_id: userId, question_id: questionId });

    if (error) throw error;
  },
};
