import { supabase } from '../lib/supabase';
import { mockTestsList, mockQuestions } from '../data/mockData';
import {
  UserAnswerState,
  SecureExamQuestion,
  TestAttemptResult,
  SectionResultData,
  Question,
  MockTestMeta
} from '../types';

const ATTEMPT_LOCAL_PREFIX = 'bankclerk_active_attempt_';
const SYNC_QUEUE_KEY = 'bankclerk_pending_answers_queue';

export const attemptService = {
  /**
   * Helper to retrieve mock test metadata
   */
  async getTestMeta(testId: string): Promise<MockTestMeta> {
    const foundMock = mockTestsList.find((t) => t.id === testId);
    if (foundMock) return foundMock;

    try {
      const { data, error } = await supabase
        .from('mock_tests')
        .select('*, exams(title, code), mock_test_sections(*, sections(name))')
        .eq('id', testId)
        .single();

      if (error || !data) throw error;
      return {
        id: data.id,
        title: data.title,
        exam: data.exams?.title || 'SBI Clerk',
        phase: 'prelims',
        durationMinutes: data.duration_minutes,
        totalQuestions: data.total_questions,
        totalMarks: data.total_marks,
        sections: (data.mock_test_sections || []).map((s: any) => ({
          id: s.id,
          sectionId: s.section_id,
          sectionName: s.sections?.name || 'General',
          questionCount: s.question_count,
          marksPerQuestion: Number(s.marks_per_question) || 1,
          negativeMarks: Number(s.negative_marks) || 0.25,
        })),
        attemptsCount: 0,
        isFreeSample: data.is_free_sample,
        isPublished: data.is_published,
      };
    } catch {
      return mockTestsList[0];
    }
  },

  /**
   * Starts a new attempt or restores an active attempt for the user.
   * Ensures fixed question selection per attempt and strips answer keys.
   */
  async startAttempt(testId: string, userId: string = 'usr-student-1') {
    const testMeta = await this.getTestMeta(testId);

    // 1. Check local storage cache
    const cachedAttemptJson = localStorage.getItem(`${ATTEMPT_LOCAL_PREFIX}${testId}_${userId}`);
    if (cachedAttemptJson) {
      try {
        const cached = JSON.parse(cachedAttemptJson);
        if (cached.status === 'in_progress') {
          return {
            attemptId: cached.id as string,
            testMeta,
            questions: cached.questions as SecureExamQuestion[],
            userAnswers: cached.answers as Record<string, UserAnswerState>,
            startedAtMs: new Date(cached.started_at).getTime(),
            durationMinutes: testMeta.durationMinutes,
          };
        }
      } catch (e) {
        console.warn('Failed to parse cached attempt', e);
      }
    }

    // 2. Query Supabase
    try {
      const { data: existingAttempt } = await supabase
        .from('test_attempts')
        .select('*, attempt_answers(*)')
        .eq('mock_test_id', testId)
        .eq('user_id', userId)
        .eq('status', 'in_progress')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingAttempt) {
        const secureQs = await this.getSecureQuestionsForAttempt(existingAttempt.id, testMeta);
        const answersMap: Record<string, UserAnswerState> = {};
        (existingAttempt.attempt_answers || []).forEach((ans: any) => {
          answersMap[ans.question_id] = {
            questionId: ans.question_id,
            selectedOptionId: ans.selected_option_id,
            status: ans.status || 'not_visited',
            timeSpentSeconds: ans.time_spent_seconds || 0,
          };
        });

        this.cacheAttemptLocally(testId, userId, {
          id: existingAttempt.id,
          status: 'in_progress',
          started_at: existingAttempt.started_at,
          questions: secureQs,
          answers: answersMap,
        });

        return {
          attemptId: existingAttempt.id,
          testMeta,
          questions: secureQs,
          userAnswers: answersMap,
          startedAtMs: new Date(existingAttempt.started_at).getTime(),
          durationMinutes: testMeta.durationMinutes,
        };
      }
    } catch {
      // Continue
    }

    // 3. Generate fixed question set
    const secureQs = await this.generateFixedQuestionsForTest(testMeta);
    const newAttemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startedAtIso = new Date().toISOString();

    const initialAnswers: Record<string, UserAnswerState> = {};
    secureQs.forEach((q) => {
      initialAnswers[q.id] = {
        questionId: q.id,
        selectedOptionId: null,
        status: 'not_visited',
        timeSpentSeconds: 0,
      };
    });

    try {
      await supabase.from('test_attempts').insert({
        id: newAttemptId,
        mock_test_id: testId,
        user_id: userId,
        status: 'in_progress',
        started_at: startedAtIso,
        max_score: testMeta.totalMarks,
      });

      const dbAns = secureQs.map((q) => ({
        attempt_id: newAttemptId,
        question_id: q.id,
        status: 'not_visited',
        time_spent_seconds: 0,
      }));
      await supabase.from('attempt_answers').insert(dbAns);
    } catch {
      // Local fallback
    }

    this.cacheAttemptLocally(testId, userId, {
      id: newAttemptId,
      status: 'in_progress',
      started_at: startedAtIso,
      questions: secureQs,
      answers: initialAnswers,
    });

    return {
      attemptId: newAttemptId,
      testMeta,
      questions: secureQs,
      userAnswers: initialAnswers,
      startedAtMs: new Date(startedAtIso).getTime(),
      durationMinutes: testMeta.durationMinutes,
    };
  },

  async generateFixedQuestionsForTest(testMeta: MockTestMeta): Promise<SecureExamQuestion[]> {
    try {
      const { data: preAssigned, error } = await supabase
        .from('mock_test_questions')
        .select('question_order, questions(*, question_options(id, option_key, option_text), sections(name), topics(title))')
        .eq('mock_test_id', testMeta.id)
        .eq('questions.status', 'published')
        .order('question_order');

      if (!error && preAssigned && preAssigned.length > 0) {
        return preAssigned.map((item: any) => ({
          id: item.questions.id,
          sectionId: item.questions.section_id || 's-quant',
          sectionName: item.questions.sections?.name || 'Quantitative Aptitude',
          topicId: item.questions.topic_id || 't-1',
          topicTitle: item.questions.topics?.title || 'General',
          difficulty: item.questions.difficulty || 'Moderate',
          questionText: item.questions.question_text,
          options: (item.questions.question_options || []).map((opt: any) => ({
            id: opt.id,
            option_key: opt.option_key || opt.id,
            text: opt.option_text || opt.text,
          })),
        }));
      }
    } catch {
      // Fallback
    }

    const publishedQuestions = mockQuestions.filter((q) => q.status === 'published');
    const generated: SecureExamQuestion[] = [];
    const targetSections = Array.isArray(testMeta.sections) ? testMeta.sections : [];

    if (targetSections.length > 0) {
      targetSections.forEach((sec: any) => {
        const secName = typeof sec === 'string' ? sec : sec.sectionName;
        const count = typeof sec === 'object' ? sec.questionCount : 10;

        const matching = publishedQuestions.filter((q) => q.section === secName);
        const pool = matching.length > 0 ? matching : publishedQuestions;

        for (let i = 0; i < count; i++) {
          const base = pool[i % pool.length];
          const qId = `${base.id}-s${i + 1}`;
          generated.push({
            id: qId,
            sectionId: `sec-${secName.toLowerCase().replace(/\s+/g, '-')}`,
            sectionName: secName,
            topicId: 'topic-gen',
            topicTitle: base.topic || 'General Aptitude',
            difficulty: base.difficulty || 'Moderate',
            questionText: i === 0 ? base.questionText : `[Q${i + 1} - ${secName}] ${base.questionText}`,
            options: base.options.map((opt) => ({
              id: opt.id,
              option_key: opt.id.replace('opt-', '').toUpperCase(),
              text: opt.text,
            })),
          });
        }
      });
    } else {
      publishedQuestions.forEach((base, idx) => {
        generated.push({
          id: `${base.id}-${idx}`,
          sectionId: `sec-${base.section.toLowerCase().replace(/\s+/g, '-')}`,
          sectionName: base.section,
          topicId: 'topic-gen',
          topicTitle: base.topic,
          difficulty: base.difficulty,
          questionText: base.questionText,
          options: base.options.map((opt) => ({
            id: opt.id,
            option_key: opt.id.replace('opt-', '').toUpperCase(),
            text: opt.text,
          })),
        });
      });
    }

    return generated;
  },

  async getSecureQuestionsForAttempt(attemptId: string, testMeta: MockTestMeta): Promise<SecureExamQuestion[]> {
    return this.generateFixedQuestionsForTest(testMeta);
  },

  async updateAnswer(
    testId: string,
    userId: string,
    attemptId: string,
    answer: UserAnswerState
  ) {
    const cacheKey = `${ATTEMPT_LOCAL_PREFIX}${testId}_${userId}`;
    const cachedAttemptJson = localStorage.getItem(cacheKey);
    if (cachedAttemptJson) {
      try {
        const cached = JSON.parse(cachedAttemptJson);
        if (!cached.answers) cached.answers = {};
        cached.answers[answer.questionId] = answer;
        localStorage.setItem(cacheKey, JSON.stringify(cached));
      } catch (e) {
        console.warn('Error updating local answer cache', e);
      }
    }

    try {
      await supabase
        .from('attempt_answers')
        .upsert({
          attempt_id: attemptId,
          question_id: answer.questionId,
          selected_option_id: answer.selectedOptionId,
          status: answer.status,
          time_spent_seconds: answer.timeSpentSeconds,
        }, { onConflict: 'attempt_id,question_id' });
    } catch {
      this.enqueuePendingAnswer({ attemptId, answer });
    }
  },

  enqueuePendingAnswer(item: { attemptId: string; answer: UserAnswerState }) {
    try {
      const existing = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
      existing.push(item);
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(existing));
    } catch {
      // Local storage limit
    }
  },

  async submitAttempt(
    testId: string,
    userId: string,
    attemptId: string,
    userAnswers: Record<string, UserAnswerState>,
    testMeta: MockTestMeta,
    timeSpentSeconds: number
  ): Promise<TestAttemptResult> {
    const cacheKey = `${ATTEMPT_LOCAL_PREFIX}${testId}_${userId}`;

    // Double-submit guard check
    const cachedJson = localStorage.getItem(cacheKey);
    if (cachedJson) {
      try {
        const cached = JSON.parse(cachedJson);
        if (cached.status === 'completed' && cached.result) {
          return cached.result as TestAttemptResult;
        }
      } catch {
        // Fall through
      }
    }

    let totalAttempted = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalSkipped = 0;
    let rawScore = 0;

    const sectionBreakdown: Record<string, SectionResultData> = {};

    const sections = Array.isArray(testMeta.sections) ? testMeta.sections : [];
    sections.forEach((sec: any) => {
      const sName = typeof sec === 'string' ? sec : sec.sectionName;
      sectionBreakdown[sName] = {
        sectionId: sName,
        sectionName: sName,
        totalQuestions: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        skipped: 0,
        score: 0,
        maxScore: (sec.questionCount || 10) * (sec.marksPerQuestion || 1),
        accuracy: 0,
      };
    });

    const revealedQuestions: Question[] = [];

    Object.keys(userAnswers).forEach((qId) => {
      const userAns = userAnswers[qId];
      const baseId = qId.split('-s')[0];
      const template = mockQuestions.find((mq) => mq.id === baseId || mq.id === qId) || mockQuestions[0];

      const sName = template.section || 'Quantitative Aptitude';
      if (!sectionBreakdown[sName]) {
        sectionBreakdown[sName] = {
          sectionId: sName,
          sectionName: sName,
          totalQuestions: 0,
          attempted: 0,
          correct: 0,
          incorrect: 0,
          skipped: 0,
          score: 0,
          maxScore: 10,
          accuracy: 0,
        };
      }

      const secStat = sectionBreakdown[sName];
      secStat.totalQuestions += 1;

      revealedQuestions.push({
        ...template,
        id: qId,
        questionText: template.questionText,
      });

      if (!userAns.selectedOptionId) {
        totalSkipped++;
        secStat.skipped++;
      } else {
        totalAttempted++;
        secStat.attempted++;

        const correctOpt = template.correctOptionId || 'A';
        const isCorrectOption = userAns.selectedOptionId === correctOpt ||
          userAns.selectedOptionId.endsWith(correctOpt.replace('opt-', ''));

        if (isCorrectOption) {
          totalCorrect++;
          secStat.correct++;
          rawScore += 1.0;
          secStat.score += 1.0;
        } else {
          totalWrong++;
          secStat.incorrect++;
          rawScore -= 0.25;
          secStat.score -= 0.25;
        }
      }
    });

    const overallAccuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;
    Object.values(sectionBreakdown).forEach((sec) => {
      sec.score = Math.max(0, Math.round(sec.score * 100) / 100);
      sec.accuracy = sec.attempted > 0 ? Math.round((sec.correct / sec.attempted) * 1000) / 10 : 0;
    });

    const finalScore = Math.max(0, Math.round(rawScore * 100) / 100);

    const result: TestAttemptResult = {
      attemptId,
      testId,
      testTitle: testMeta.title,
      exam: testMeta.exam,
      dateCompleted: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      timeSpentSeconds,
      totalQuestions: testMeta.totalQuestions || Object.keys(userAnswers).length,
      attemptedQuestions: totalAttempted,
      correctAnswers: totalCorrect,
      wrongAnswers: totalWrong,
      skippedQuestions: totalSkipped,
      score: finalScore,
      maxScore: testMeta.totalMarks,
      accuracy: Math.round(overallAccuracy * 10) / 10,
      percentile: Math.min(99.9, Math.round((85 + (finalScore / testMeta.totalMarks) * 14) * 10) / 10),
      sectionBreakdown,
      topicBreakdown: {},
      userAnswers,
      questionsWithAnswers: revealedQuestions,
    };

    this.cacheAttemptLocally(testId, userId, {
      id: attemptId,
      status: 'completed',
      submitted_at: new Date().toISOString(),
      result,
    });

    try {
      await supabase
        .from('test_attempts')
        .update({
          status: 'completed',
          submitted_at: new Date().toISOString(),
          time_spent_seconds: timeSpentSeconds,
          total_score: finalScore,
          accuracy_percent: Math.round(overallAccuracy * 100) / 100,
          attempted_count: totalAttempted,
          correct_count: totalCorrect,
          incorrect_count: totalWrong,
          skipped_count: totalSkipped,
        })
        .eq('id', attemptId);
    } catch {
      // Offline fallback
    }

    return result;
  },

  cacheAttemptLocally(testId: string, userId: string, data: any) {
    try {
      localStorage.setItem(`${ATTEMPT_LOCAL_PREFIX}${testId}_${userId}`, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to cache attempt locally', e);
    }
  },

  async getCompletedAttemptResult(testId: string, userId: string = 'usr-student-1'): Promise<TestAttemptResult | null> {
    const cachedJson = localStorage.getItem(`${ATTEMPT_LOCAL_PREFIX}${testId}_${userId}`);
    if (cachedJson) {
      try {
        const cached = JSON.parse(cachedJson);
        if (cached.result) return cached.result as TestAttemptResult;
      } catch {
        // Fallback
      }
    }
    return null;
  },
};
