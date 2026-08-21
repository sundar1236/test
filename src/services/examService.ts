import { supabase } from '../lib/supabase';

export const examService = {
  async getExams() {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('title');
    if (error) throw error;
    return data;
  },

  async createExam(code: string, title: string, description?: string) {
    const { data, error } = await supabase
      .from('exams')
      .insert({ code, title, description, is_active: true })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateExamStatus(examId: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('exams')
      .update({ is_active: isActive })
      .eq('id', examId)
      .select()
      .single();
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

  async createSection(code: string, name: string) {
    const { data, error } = await supabase
      .from('sections')
      .insert({ code, name })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
