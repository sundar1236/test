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
      .select('*, sections(name, code)')
      .order('title');
    if (error) throw error;
    return data;
  },

  async createTopic(sectionId: string, title: string, description?: string, parentTopicId?: string) {
    const { data, error } = await supabase
      .from('topics')
      .insert({
        section_id: sectionId,
        title,
        description: description || null,
        parent_topic_id: parentTopicId || null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateTopic(topicId: string, title: string, description?: string) {
    const { data, error } = await supabase
      .from('topics')
      .update({ title, description })
      .eq('id', topicId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
