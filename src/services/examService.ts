import { supabase } from '../lib/supabase';

export const examService = {
  async getExams() {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('is_active', true)
      .order('title');
    if (error) throw error;
    return data;
  },

  async getSections() {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },
};
