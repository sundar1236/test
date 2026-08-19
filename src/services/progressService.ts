import { supabase } from '../lib/supabase';

export const progressService = {
  async getUserProgress(userId: string) {
    const { data, error } = await supabase
      .from('user_topic_progress')
      .select('*, topics(title, sections(name))')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async updateUserTopicProgress(userId: string, topicId: string, attemptedCount: number, correctCount: number) {
    const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;

    const { data, error } = await supabase
      .from('user_topic_progress')
      .upsert({
        user_id: userId,
        topic_id: topicId,
        total_questions_attempted: attemptedCount,
        total_correct: correctCount,
        accuracy_percent: accuracy,
        last_practiced_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
