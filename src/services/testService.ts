import { supabase } from '../lib/supabase';

export const testService = {
  async getPublishedTests() {
    const { data, error } = await supabase
      .from('mock_tests')
      .select('*, exams(title, code), mock_test_sections(*, sections(name))')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getTestWithQuestions(testId: string) {
    const { data: testMeta, error: testErr } = await supabase
      .from('mock_tests')
      .select('*, exams(title, code)')
      .eq('id', testId)
      .single();

    if (testErr) throw testErr;

    const { data: testQs, error: qsErr } = await supabase
      .from('mock_test_questions')
      .select('question_order, questions(*, question_options(id, option_key, option_text), sections(name), topics(title))')
      .eq('mock_test_id', testId)
      .order('question_order');

    if (qsErr) throw qsErr;

    return { testMeta, questions: testQs.map((item) => item.questions) };
  },
};
