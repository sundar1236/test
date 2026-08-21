import { supabase } from '../lib/supabase';
import {
  TestAttemptResult,
  DashboardStats,
  SectionPerformance,
  TopicPerformance,
  WeakTopic,
  PracticeRecommendation,
  ExamProgressSummary,
  ExamCategory
} from '../types';

/** Threshold Rules for Weak Area & Performance Classifications */
export const PERFORMANCE_THRESHOLDS = {
  WEAK_ACCURACY: 50.0,            // Below 50% accuracy is 'Weak'
  NEEDS_IMPROVEMENT_ACCURACY: 70.0,// 50% - 70% is 'Needs Improvement'
  GOOD_ACCURACY: 85.0,             // 70% - 85% is 'Good', >85% is 'High'
  MIN_QUESTIONS_THRESHOLD: 3,      // Must attempt >= 3 questions in topic to be labeled weak
};

export const progressService = {
  /**
   * Calculates aggregated student dashboard KPIs from test attempt history.
   */
  calculateDashboardStats(attempts: TestAttemptResult[]): DashboardStats {
    if (attempts.length === 0) {
      return {
        totalTestsAttempted: 0,
        completedTests: 0,
        avgScore: 0,
        avgAccuracy: 0,
        bestScore: 0,
        questionsAttempted: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        unansweredQuestions: 0,
      };
    }

    const totalTestsAttempted = attempts.length;
    const completedTests = attempts.length; // Active attempts filter applied upstream

    let totalScoreSum = 0;
    let totalAccuracySum = 0;
    let bestScore = 0;
    let questionsAttempted = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unansweredQuestions = 0;

    attempts.forEach((a) => {
      totalScoreSum += a.score;
      totalAccuracySum += a.accuracy;
      if (a.score > bestScore) bestScore = a.score;

      questionsAttempted += a.attemptedQuestions;
      correctAnswers += a.correctAnswers;
      incorrectAnswers += a.wrongAnswers;
      unansweredQuestions += a.skippedQuestions;
    });

    return {
      totalTestsAttempted,
      completedTests,
      avgScore: Math.round((totalScoreSum / totalTestsAttempted) * 100) / 100,
      avgAccuracy: Math.round((totalAccuracySum / totalTestsAttempted) * 10) / 10,
      bestScore: Math.round(bestScore * 100) / 100,
      questionsAttempted,
      correctAnswers,
      incorrectAnswers,
      unansweredQuestions,
    };
  },

  /**
   * Section-wise performance aggregation across all attempts
   */
  calculateSectionPerformance(attempts: TestAttemptResult[]): SectionPerformance[] {
    const secMap: Record<string, { total: number; attempted: number; correct: number; incorrect: number; skipped: number; score: number }> = {};

    attempts.forEach((a) => {
      Object.entries(a.sectionBreakdown || {}).forEach(([sName, sec]) => {
        if (!secMap[sName]) {
          secMap[sName] = { total: 0, attempted: 0, correct: 0, incorrect: 0, skipped: 0, score: 0 };
        }
        const item = secMap[sName];
        item.total += sec.totalQuestions || 10;
        item.attempted += sec.attempted || 0;
        item.correct += sec.correct || 0;
        item.incorrect += sec.incorrect || 0;
        item.skipped += sec.skipped || 0;
        item.score += sec.score || 0;
      });
    });

    return Object.entries(secMap).map(([sName, data]) => {
      const accuracy = data.attempted > 0 ? (data.correct / data.attempted) * 100 : 0;
      let level: 'High' | 'Good' | 'Needs Improvement' | 'Weak' = 'Good';

      if (data.attempted >= PERFORMANCE_THRESHOLDS.MIN_QUESTIONS_THRESHOLD) {
        if (accuracy < PERFORMANCE_THRESHOLDS.WEAK_ACCURACY) level = 'Weak';
        else if (accuracy < PERFORMANCE_THRESHOLDS.NEEDS_IMPROVEMENT_ACCURACY) level = 'Needs Improvement';
        else if (accuracy >= PERFORMANCE_THRESHOLDS.GOOD_ACCURACY) level = 'High';
      }

      return {
        sectionName: sName,
        totalQuestions: data.total,
        attempted: data.attempted,
        correct: data.correct,
        incorrect: data.incorrect,
        unanswered: data.skipped,
        score: Math.round(data.score * 100) / 100,
        accuracy: Math.round(accuracy * 10) / 10,
        performanceLevel: level,
      };
    });
  },

  /**
   * Topic-wise performance tracking
   */
  calculateTopicPerformance(attempts: TestAttemptResult[]): TopicPerformance[] {
    const topicMap: Record<string, { section: string; total: number; correct: number }> = {};

    attempts.forEach((a) => {
      Object.entries(a.topicBreakdown || {}).forEach(([tName, top]) => {
        if (!topicMap[tName]) {
          topicMap[tName] = { section: 'General', total: 0, correct: 0 };
        }
        topicMap[tName].total += top.total || 0;
        topicMap[tName].correct += top.correct || 0;
      });
    });

    return Object.entries(topicMap).map(([tName, data]) => {
      const accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0;
      let level: 'High' | 'Good' | 'Needs Improvement' | 'Weak' = 'Good';

      if (data.total >= PERFORMANCE_THRESHOLDS.MIN_QUESTIONS_THRESHOLD) {
        if (accuracy < PERFORMANCE_THRESHOLDS.WEAK_ACCURACY) level = 'Weak';
        else if (accuracy < PERFORMANCE_THRESHOLDS.NEEDS_IMPROVEMENT_ACCURACY) level = 'Needs Improvement';
        else if (accuracy >= PERFORMANCE_THRESHOLDS.GOOD_ACCURACY) level = 'High';
      }

      return {
        topicName: tName,
        sectionName: data.section,
        attemptedQuestions: data.total,
        correctAnswers: data.correct,
        accuracy: Math.round(accuracy * 10) / 10,
        performanceLevel: level,
      };
    });
  },

  /**
   * Rule-based Weak Topic Identification
   * Requires min questions threshold (>= 3) and accuracy below 70%
   */
  identifyWeakTopics(attempts: TestAttemptResult[]): WeakTopic[] {
    const topics = this.calculateTopicPerformance(attempts);
    return topics
      .filter((t) => t.attemptedQuestions >= PERFORMANCE_THRESHOLDS.MIN_QUESTIONS_THRESHOLD && t.accuracy < PERFORMANCE_THRESHOLDS.NEEDS_IMPROVEMENT_ACCURACY)
      .map((t) => {
        const level: 'Weak' | 'Needs Improvement' = t.accuracy < PERFORMANCE_THRESHOLDS.WEAK_ACCURACY ? 'Weak' : 'Needs Improvement';
        return {
          topicName: t.topicName,
          sectionName: t.sectionName,
          accuracy: t.accuracy,
          questionsAttempted: t.attemptedQuestions,
          performanceLevel: level,
        };
      })
      .sort((a, b) => a.accuracy - b.accuracy);
  },

  /**
   * Generates rule-based practice recommendations based on weak topics & sections
   */
  generatePracticeRecommendations(attempts: TestAttemptResult[]): PracticeRecommendation[] {
    const weakTopics = this.identifyWeakTopics(attempts);
    const recs: PracticeRecommendation[] = [];

    weakTopics.forEach((wt, idx) => {
      recs.push({
        id: `rec-${idx + 1}`,
        topicName: wt.topicName,
        sectionName: wt.sectionName,
        recommendedQuestionCount: wt.performanceLevel === 'Weak' ? 25 : 15,
        reason: `Your accuracy in ${wt.topicName} is currently ${wt.accuracy}% (below target threshold).`,
        actionText: `Practice ${wt.topicName} Set`,
      });
    });

    if (recs.length === 0 && attempts.length > 0) {
      recs.push({
        id: 'rec-default',
        topicName: 'Full Speed Booster Mock',
        sectionName: 'All Sections',
        recommendedQuestionCount: 30,
        reason: 'Great performance across topics! Maintain momentum with a high-speed sectional mock.',
        actionText: 'Take Speed Mock',
      });
    }

    return recs;
  },

  /**
   * Exam-specific statistics breakdown (SBI Clerk, IBPS Clerk, RBI Assistant, RRB Clerk)
   */
  calculateExamProgressSummaries(attempts: TestAttemptResult[]): ExamProgressSummary[] {
    const examsList: ExamCategory[] = ['SBI Clerk', 'IBPS Clerk', 'RBI Assistant', 'RRB Clerk'];

    return examsList.map((exam) => {
      const filtered = attempts.filter((a) => a.exam === exam);
      if (filtered.length === 0) {
        return {
          exam,
          testsTaken: 0,
          avgScore: 0,
          avgAccuracy: 0,
          bestScore: 0,
        };
      }

      let scoreSum = 0;
      let accSum = 0;
      let best = 0;

      filtered.forEach((a) => {
        scoreSum += a.score;
        accSum += a.accuracy;
        if (a.score > best) best = a.score;
      });

      return {
        exam,
        testsTaken: filtered.length,
        avgScore: Math.round((scoreSum / filtered.length) * 100) / 100,
        avgAccuracy: Math.round((accSum / filtered.length) * 10) / 10,
        bestScore: Math.round(best * 100) / 100,
      };
    });
  },
};
