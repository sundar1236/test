import { supabase } from '../lib/supabase';

export const topicService = {
  async getTopicsBySection(sectionId: string) {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('section_id', sectionId)
      .order('title');
    if (error) throw error;
    return data;
  },

  async getAllTopics() {
    const { data, error } = await supabase
      .from('topics')
      .select('*, sections(name)')
      .order('title');
    if (error) throw error;
    return data;
  },
};
