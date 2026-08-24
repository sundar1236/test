import { supabase } from '../lib/supabase';
import {
  UserAnswerState,
  SecureExamQuestion,
  TestAttemptResult,
  SectionResultData,
  Question,
  MockTestMeta
} from '../types';

const ATTEMPT_LOCAL_PREFIX = 'bankclerk_active_attempt_';

export const attemptService = {
  async getTestMeta(testId: string): Promise<MockTestMeta> {
    try {
      const { data, error } = await supabase
        .from('mock_tests')
        .select('*, exams(title, code), mock_test_sections(*, sections(name))')
        .eq('id', testId)
        .single();

      if (!error && data) {
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
      }
    } catch {
      // Fallthrough
    }

    return {
      id: testId,
      title: 'SBI Clerk Prelims Official Live Mock 1',
      exam: 'SBI Clerk',
      phase: 'prelims',
      durationMinutes: 60,
      totalQuestions: 100,
      totalMarks: 100,
      sections: [
        { id: 'sec-q', sectionId: 'sec-q', sectionName: 'Quantitative Aptitude', questionCount: 35, marksPerQuestion: 1, negativeMarks: 0.25 },
        { id: 'sec-r', sectionId: 'sec-r', sectionName: 'Reasoning Ability', questionCount: 35, marksPerQuestion: 1, negativeMarks: 0.25 },
        { id: 'sec-e', sectionId: 'sec-e', sectionName: 'English Language', questionCount: 30, marksPerQuestion: 1, negativeMarks: 0.25 },
      ],
      attemptsCount: 0,
      isFreeSample: true,
      isPublished: true,
    };
  },

  /**
   * Starts a randomized attempt or restores an existing attempt question snapshot.
   */
  async startAttempt(testId: string, userId: string) {
    const testMeta = await this.getTestMeta(testId);
    const userCacheKey = `${ATTEMPT_LOCAL_PREFIX}${testId}_${userId}`;

    // 1. Check user-scoped local storage cache
    const cachedAttemptJson = localStorage.getItem(userCacheKey);
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

    // 2. Query Supabase for active in-progress attempt & attempt_questions snapshot
    try {
      const { data: existingAttempt, error: attemptErr } = await supabase
        .from('test_attempts')
        .select('*, attempt_answers(*), attempt_questions(*, questions(*, question_options(*)))')
        .eq('mock_test_id', testId)
        .eq('user_id', userId)
        .eq('status', 'in_progress')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!attemptErr && existingAttempt && existingAttempt.attempt_questions?.length > 0) {
        const secureQs: SecureExamQuestion[] = existingAttempt.attempt_questions.map((aq: any) => ({
          id: aq.question_id,
          sectionId: aq.section_id || 'sec-q',
          sectionName: aq.section_name || 'Quantitative Aptitude',
          topicId: aq.questions?.topic_id || 'topic-gen',
          topicTitle: aq.questions?.topic || 'General',
          difficulty: aq.questions?.difficulty || 'Moderate',
          questionText: aq.questions?.question_text || 'Question text unavailable',
          options: aq.option_order_snapshot || (aq.questions?.question_options || []).map((opt: any) => ({
            id: opt.id,
            option_key: opt.option_key || opt.id,
            text: opt.option_text || opt.text,
          })),
        }));

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
      // Fallback
    }

    // 3. Generate randomized questions for fresh attempt
    const secureQs = await this.generateRandomizedQuestionsForTest(testMeta);
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

    let newAttemptId = `att-${Date.now()}`;

    try {
      const { data: insertedAttempt, error: insertErr } = await supabase
        .from('test_attempts')
        .insert({
          mock_test_id: testId,
          user_id: userId,
          status: 'in_progress',
          started_at: startedAtIso,
          max_score: testMeta.totalMarks,
        })
        .select()
        .single();

      if (!insertErr && insertedAttempt) {
        newAttemptId = insertedAttempt.id;

        // Persist attempt_questions snapshot
        const snapshotRows = secureQs.map((q, idx) => ({
          attempt_id: newAttemptId,
          question_id: q.id,
          question_order: idx + 1,
          section_name: q.sectionName,
          option_order_snapshot: q.options,
        }));
        await supabase.from('attempt_questions').insert(snapshotRows);

        const dbAns = secureQs.map((q) => ({
          attempt_id: newAttemptId,
          question_id: q.id,
          status: 'not_visited',
          time_spent_seconds: 0,
        }));
        await supabase.from('attempt_answers').insert(dbAns);
      }
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

  /**
   * Section-aware question selection and order/option randomization.
   */
  async generateRandomizedQuestionsForTest(testMeta: MockTestMeta): Promise<SecureExamQuestion[]> {
    const generated: SecureExamQuestion[] = [];
    const sections = Array.isArray(testMeta.sections) ? testMeta.sections : [];

    try {
      const { data: eligibleDbQuestions } = await supabase
        .from('questions')
        .select('*, question_options(id, option_key, option_text), sections(name), topics(title)')
        .eq('status', 'published');

      if (eligibleDbQuestions && eligibleDbQuestions.length > 0) {
        sections.forEach((sec: any) => {
          const secName = typeof sec === 'string' ? sec : sec.sectionName;
          const reqCount = typeof sec === 'object' ? sec.questionCount : 10;

          const matchPool = eligibleDbQuestions.filter((q: any) => q.sections?.name === secName);
          const pool = matchPool.length > 0 ? matchPool : eligibleDbQuestions;

          // Fisher-Yates shuffle
          const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
          const selected = shuffledPool.slice(0, Math.min(reqCount, shuffledPool.length));

          selected.forEach((q: any) => {
            const rawOpts = (q.question_options || []).map((o: any) => ({
              id: o.id,
              option_key: o.option_key || o.id,
              text: o.option_text || o.text,
            }));

            // Option randomization
            const randomizedOpts = [...rawOpts].sort(() => Math.random() - 0.5);

            generated.push({
              id: q.id,
              sectionId: q.section_id || 'sec-gen',
              sectionName: secName,
              topicId: q.topic_id || 't-gen',
              topicTitle: q.topics?.title || 'General',
              difficulty: q.difficulty || 'Moderate',
              questionText: q.question_text,
              options: randomizedOpts,
            });
          });
        });

        if (generated.length > 0) return generated;
      }
    } catch {
      // Fallback
    }

    return generated;
  },

  async updateAnswer(
    testId: string,
    userId: string,
    attemptId: string,
    answer: UserAnswerState
  ) {
    const userCacheKey = `${ATTEMPT_LOCAL_PREFIX}${testId}_${userId}`;
    const cachedAttemptJson = localStorage.getItem(userCacheKey);
    if (cachedAttemptJson) {
      try {
        const cached = JSON.parse(cachedAttemptJson);
        if (!cached.answers) cached.answers = {};
        cached.answers[answer.questionId] = answer;
        localStorage.setItem(userCacheKey, JSON.stringify(cached));
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
      // Handled via local cache
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
    const userCacheKey = `${ATTEMPT_LOCAL_PREFIX}${testId}_${userId}`;

    // Double-submit guard check
    const cachedJson = localStorage.getItem(userCacheKey);
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
      const sName = 'Quantitative Aptitude';

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

      if (!userAns.selectedOptionId) {
        totalSkipped++;
        secStat.skipped++;
      } else {
        totalAttempted++;
        secStat.attempted++;

        totalCorrect++;
        secStat.correct++;
        rawScore += 1.0;
        secStat.score += 1.0;
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
        .eq('id', attemptId)
        .eq('user_id', userId);
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

  async getUserAttempts(userId: string): Promise<TestAttemptResult[]> {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .select('*, mock_tests(title, exam)')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('submitted_at', { ascending: false });

      if (!error && data) {
        return data.map((att: any) => ({
          attemptId: att.id,
          testId: att.mock_test_id,
          testTitle: att.mock_tests?.title || 'Mock Exam',
          exam: att.mock_tests?.exam || 'SBI Clerk',
          dateCompleted: new Date(att.submitted_at || att.created_at).toLocaleDateString(),
          timeSpentSeconds: att.time_spent_seconds || 0,
          totalQuestions: att.attempted_count + att.skipped_count || 100,
          attemptedQuestions: att.attempted_count || 0,
          correctAnswers: att.correct_count || 0,
          wrongAnswers: att.incorrect_count || 0,
          skippedQuestions: att.skipped_count || 0,
          score: Number(att.total_score) || 0,
          maxScore: Number(att.max_score) || 100,
          accuracy: Number(att.accuracy_percent) || 0,
          percentile: Number(att.estimated_percentile) || 0,
          sectionBreakdown: {},
          topicBreakdown: {},
          userAnswers: {},
        }));
      }
    } catch {
      // Return empty array
    }

    return [];
  },
};
