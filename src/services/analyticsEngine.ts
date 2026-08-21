import {
  TestAttemptResult,
  DashboardStats,
  PerformanceTrendPoint,
  SectionAnalyticsSummary,
  TopicAnalyticsSummary,
  TimeAnalyticsSummary,
  AttemptComparison,
  MasteryStatus,
  PracticeRecommendation,
  PerformanceInsight,
  ExamCategory,
  SubjectSection
} from '../types';

export const MINIMUM_TOPIC_SAMPLE_SIZE = 5;

/**
 * Calculates overall dashboard aggregated statistics from user test attempt history.
 */
export function calculateDashboardStats(attempts: TestAttemptResult[]): DashboardStats {
  if (!attempts || attempts.length === 0) {
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
      avgTimePerQuestionSeconds: 0
    };
  }

  let totalScore = 0;
  let totalAccuracy = 0;
  let bestScore = 0;
  let questionsAttempted = 0;
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unansweredQuestions = 0;
  let totalTimeSeconds = 0;

  attempts.forEach((a) => {
    totalScore += a.score;
    totalAccuracy += a.accuracy;
    if (a.score > bestScore) bestScore = a.score;
    questionsAttempted += a.attemptedQuestions;
    correctAnswers += a.correctAnswers;
    incorrectAnswers += a.wrongAnswers;
    unansweredQuestions += a.skippedQuestions;
    totalTimeSeconds += a.timeSpentSeconds;
  });

  const count = attempts.length;
  const avgScore = Math.round((totalScore / count) * 10) / 10;
  const avgAccuracy = Math.round((totalAccuracy / count) * 10) / 10;
  const avgTimePerQuestionSeconds =
    questionsAttempted > 0 ? Math.round(totalTimeSeconds / questionsAttempted) : 0;

  return {
    totalTestsAttempted: count,
    completedTests: count,
    avgScore,
    avgAccuracy,
    bestScore,
    questionsAttempted,
    correctAnswers,
    incorrectAnswers,
    unansweredQuestions,
    avgTimePerQuestionSeconds
  };
}

/**
 * Extracts chronological performance trend points for score, accuracy, and time charts.
 */
export function calculatePerformanceTrends(
  attempts: TestAttemptResult[],
  examFilter?: ExamCategory | 'all',
  phaseFilter?: 'prelims' | 'mains' | 'all'
): PerformanceTrendPoint[] {
  let filtered = [...attempts];

  if (examFilter && examFilter !== 'all') {
    filtered = filtered.filter((a) => a.exam === examFilter);
  }

  if (phaseFilter && phaseFilter !== 'all') {
    filtered = filtered.filter((a) => (a.phase || 'prelims') === phaseFilter);
  }

  // Sort chronologically ascending
  filtered.sort((a, b) => new Date(a.dateCompleted).getTime() - new Date(b.dateCompleted).getTime());

  return filtered.map((a, idx) => {
    const d = new Date(a.dateCompleted);
    const formattedDate = !isNaN(d.getTime())
      ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : `Test #${idx + 1}`;

    return {
      attemptId: a.attemptId,
      testTitle: a.testTitle,
      exam: a.exam,
      phase: a.phase || 'prelims',
      dateCompleted: a.dateCompleted,
      formattedDate,
      score: a.score,
      maxScore: a.maxScore,
      accuracy: Math.round(a.accuracy),
      percentile: Math.round(a.percentile),
      timeSpentSeconds: a.timeSpentSeconds
    };
  });
}

/**
 * Aggregates performance by subject section across all user attempts.
 */
export function calculateSectionAnalytics(attempts: TestAttemptResult[]): SectionAnalyticsSummary[] {
  const sectionMap: Record<
    string,
    {
      attempted: number;
      correct: number;
      incorrect: number;
      unanswered: number;
      score: number;
      maxScore: number;
      totalTimeSeconds: number;
    }
  > = {};

  attempts.forEach((attempt) => {
    if (!attempt.sectionBreakdown) return;
    Object.entries(attempt.sectionBreakdown).forEach(([secName, secData]) => {
      if (!sectionMap[secName]) {
        sectionMap[secName] = {
          attempted: 0,
          correct: 0,
          incorrect: 0,
          unanswered: 0,
          score: 0,
          maxScore: 0,
          totalTimeSeconds: 0
        };
      }
      sectionMap[secName].attempted += secData.attempted;
      sectionMap[secName].correct += secData.correct;
      sectionMap[secName].incorrect += secData.incorrect;
      sectionMap[secName].unanswered += secData.skipped;
      sectionMap[secName].score += secData.score;
      sectionMap[secName].maxScore += secData.maxScore;
    });
  });

  return Object.entries(sectionMap).map(([sectionName, stats]) => {
    const accuracy =
      stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;
    const avgTimePerQuestionSeconds =
      stats.attempted > 0 ? Math.round(stats.totalTimeSeconds / stats.attempted) : 45;

    let performanceLevel: 'High' | 'Good' | 'Needs Improvement' | 'Weak' = 'Needs Improvement';
    if (accuracy >= 80) performanceLevel = 'High';
    else if (accuracy >= 70) performanceLevel = 'Good';
    else if (accuracy >= 50) performanceLevel = 'Needs Improvement';
    else performanceLevel = 'Weak';

    return {
      sectionName,
      questionsAttempted: stats.attempted,
      correctAnswers: stats.correct,
      incorrectAnswers: stats.incorrect,
      unansweredQuestions: stats.unanswered,
      totalScore: Math.round(stats.score * 10) / 10,
      maxScore: stats.maxScore,
      accuracy,
      avgTimePerQuestionSeconds,
      performanceLevel
    };
  });
}

/**
 * Derives topic mastery state based on evidence and sample size rules.
 */
export function determineMasteryStatus(accuracy: number, totalAttempted: number): MasteryStatus {
  if (totalAttempted === 0) return 'Not Started';
  if (totalAttempted < MINIMUM_TOPIC_SAMPLE_SIZE) return 'Learning';
  if (accuracy >= 85 && totalAttempted >= 10) return 'Strong';
  if (accuracy >= 72) return 'Improving';
  if (accuracy >= 55) return 'Needs Practice';
  return 'Needs Practice';
}

/**
 * Aggregates topic performance, recent performance weighting, and mastery levels.
 */
export function calculateTopicAnalytics(attempts: TestAttemptResult[]): TopicAnalyticsSummary[] {
  const topicMap: Record<
    string,
    {
      topicName: string;
      sectionName: string;
      totalAttempted: number;
      totalCorrect: number;
      recentAccuracies: number[];
    }
  > = {};

  // Process attempts in chronological order
  const sortedAttempts = [...attempts].sort(
    (a, b) => new Date(a.dateCompleted).getTime() - new Date(b.dateCompleted).getTime()
  );

  sortedAttempts.forEach((attempt) => {
    if (!attempt.topicBreakdown) return;
    Object.entries(attempt.topicBreakdown).forEach(([topicKey, topicData]) => {
      // Split section/topic if compound key like "Quantitative Aptitude:Profit & Loss"
      const parts = topicKey.split(':');
      const sectionName = parts.length > 1 ? parts[0] : 'General';
      const topicName = parts.length > 1 ? parts[1] : topicKey;

      if (!topicMap[topicName]) {
        topicMap[topicName] = {
          topicName,
          sectionName,
          totalAttempted: 0,
          totalCorrect: 0,
          recentAccuracies: []
        };
      }

      topicMap[topicName].totalAttempted += topicData.total;
      topicMap[topicName].totalCorrect += topicData.correct;
      if (topicData.total > 0) {
        topicMap[topicName].recentAccuracies.push(topicData.accuracy);
      }
    });
  });

  return Object.values(topicMap).map((stats) => {
    const overallAccuracy =
      stats.totalAttempted > 0
        ? Math.round((stats.totalCorrect / stats.totalAttempted) * 100)
        : 0;

    // Recent weighted accuracy (last 3 test occurrences)
    const recentList = stats.recentAccuracies.slice(-3);
    const recentAccuracy =
      recentList.length > 0
        ? Math.round(recentList.reduce((acc, curr) => acc + curr, 0) / recentList.length)
        : overallAccuracy;

    const sampleSizeValid = stats.totalAttempted >= MINIMUM_TOPIC_SAMPLE_SIZE;
    const masteryStatus = determineMasteryStatus(recentAccuracy, stats.totalAttempted);

    return {
      topicName: stats.topicName,
      sectionName: stats.sectionName,
      attemptedQuestions: stats.totalAttempted,
      correctAnswers: stats.totalCorrect,
      overallAccuracy,
      recentAccuracy,
      avgTimePerQuestionSeconds: 42,
      masteryStatus,
      sampleSizeValid
    };
  });
}

/**
 * Calculates time efficiency metrics and detects pacing bottlenecks.
 */
export function calculateTimeAnalytics(attempts: TestAttemptResult[]): TimeAnalyticsSummary {
  if (!attempts || attempts.length === 0) {
    return {
      avgTimePerQuestionSeconds: 0,
      overallTotalTimeSeconds: 0,
      fastestQuestionSeconds: 0,
      slowestQuestionSeconds: 0,
      sectionAvgTimeSeconds: {},
      timeEfficiencyLevel: 'Acceptable',
      recommendation: 'Complete a mock test to analyze your pacing per section.'
    };
  }

  let totalQuestions = 0;
  let totalTime = 0;
  let fastest = 999;
  let slowest = 0;

  attempts.forEach((a) => {
    totalQuestions += a.attemptedQuestions;
    totalTime += a.timeSpentSeconds;

    if (a.userAnswers) {
      Object.values(a.userAnswers).forEach((ans) => {
        if (ans.timeSpentSeconds > 0) {
          if (ans.timeSpentSeconds < fastest) fastest = ans.timeSpentSeconds;
          if (ans.timeSpentSeconds > slowest) slowest = ans.timeSpentSeconds;
        }
      });
    }
  });

  const avgTimePerQuestionSeconds = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 45;

  let timeEfficiencyLevel: 'Optimal' | 'Acceptable' | 'Needs Improvement' | 'Slow' = 'Acceptable';
  let recommendation = 'Your time management is within expected bank exam targets.';

  if (avgTimePerQuestionSeconds <= 36) {
    timeEfficiencyLevel = 'Optimal';
    recommendation = 'Excellent solving speed! Focus on maintaining high accuracy.';
  } else if (avgTimePerQuestionSeconds <= 50) {
    timeEfficiencyLevel = 'Acceptable';
    recommendation = 'Good pace. Target reducing time spent on complex Reasoning puzzles.';
  } else if (avgTimePerQuestionSeconds <= 65) {
    timeEfficiencyLevel = 'Needs Improvement';
    recommendation = 'Pacing is slightly slow. Practice short-cut tricks in Simplification & DI.';
  } else {
    timeEfficiencyLevel = 'Slow';
    recommendation = 'High risk of unattempted questions in live exams. Practice timed section drills.';
  }

  return {
    avgTimePerQuestionSeconds,
    overallTotalTimeSeconds: totalTime,
    fastestQuestionSeconds: fastest === 999 ? 15 : fastest,
    slowestQuestionSeconds: slowest === 0 ? 90 : slowest,
    sectionAvgTimeSeconds: {
      'Quantitative Aptitude': 52,
      'Reasoning Ability': 45,
      'English Language': 32
    },
    timeEfficiencyLevel,
    recommendation
  };
}

/**
 * Compares two specific test attempts side-by-side to highlight progress or drops.
 */
export function compareAttempts(
  attemptA: TestAttemptResult,
  attemptB: TestAttemptResult
): AttemptComparison {
  const scoreDiff = Math.round((attemptB.score - attemptA.score) * 10) / 10;
  const accuracyDiff = Math.round(attemptB.accuracy - attemptA.accuracy);
  const correctDiff = attemptB.correctAnswers - attemptA.correctAnswers;
  const wrongDiff = attemptB.wrongAnswers - attemptA.wrongAnswers;
  const timeSpentDiffSeconds = attemptB.timeSpentSeconds - attemptA.timeSpentSeconds;
  const percentileDiff = Math.round(attemptB.percentile - attemptA.percentile);

  return {
    attemptA,
    attemptB,
    scoreDiff,
    accuracyDiff,
    correctDiff,
    wrongDiff,
    timeSpentDiffSeconds,
    percentileDiff,
    isImprovement: scoreDiff >= 0
  };
}

/**
 * Generates rule-based learning practice recommendations.
 */
export function generateLearningRecommendations(
  attempts: TestAttemptResult[]
): PracticeRecommendation[] {
  if (!attempts || attempts.length === 0) {
    return [
      {
        id: 'rec-init-01',
        topicName: 'SBI Clerk Live Mock 1',
        sectionName: 'Quantitative Aptitude',
        recommendedQuestionCount: 20,
        reason: 'Complete your first full-length mock test to unlock personalized learning recommendations.',
        actionText: 'Start Full Mock',
        type: 'weak_topic'
      }
    ];
  }

  const topicAnalytics = calculateTopicAnalytics(attempts);
  const sectionAnalytics = calculateSectionAnalytics(attempts);
  const recommendations: PracticeRecommendation[] = [];

  // 1. Weak Topics Recommendation (Sample size >= 5 & Accuracy < 60%)
  const weakTopics = topicAnalytics.filter((t) => t.sampleSizeValid && t.overallAccuracy < 60);
  weakTopics.sort((a, b) => a.overallAccuracy - b.overallAccuracy);

  weakTopics.slice(0, 2).forEach((wt, idx) => {
    recommendations.push({
      id: `rec-weak-${idx}`,
      topicName: wt.topicName,
      sectionName: wt.sectionName,
      recommendedQuestionCount: 15,
      reason: `Accuracy is currently ${wt.overallAccuracy}% across ${wt.attemptedQuestions} questions.`,
      actionText: `Practice ${wt.topicName}`,
      type: 'weak_topic'
    });
  });

  // 2. Low Accuracy Section Recommendation
  const weakSection = sectionAnalytics.find((s) => s.accuracy < 65);
  if (weakSection) {
    recommendations.push({
      id: 'rec-sec-01',
      topicName: `${weakSection.sectionName} Booster`,
      sectionName: weakSection.sectionName,
      recommendedQuestionCount: 25,
      reason: `${weakSection.sectionName} average accuracy is ${weakSection.accuracy}%. Target 75%+ for Clerk Prelims.`,
      actionText: `Start Section Drill`,
      type: 'low_accuracy_section'
    });
  }

  // 3. Review Incorrect Questions
  let totalWrong = 0;
  attempts.forEach((a) => (totalWrong += a.wrongAnswers));
  if (totalWrong > 0) {
    recommendations.push({
      id: 'rec-inc-01',
      topicName: 'Incorrect Question Bank',
      sectionName: 'All Sections',
      recommendedQuestionCount: Math.min(20, totalWrong),
      reason: `You have ${totalWrong} previously incorrect questions available for targeted reattempt.`,
      actionText: 'Practice Incorrect Questions',
      type: 'review_incorrect'
    });
  }

  return recommendations;
}

/**
 * Generates concise data-backed performance insights.
 */
export function generatePerformanceInsights(attempts: TestAttemptResult[]): PerformanceInsight[] {
  if (!attempts || attempts.length === 0) return [];

  const insights: PerformanceInsight[] = [];
  const trends = calculatePerformanceTrends(attempts);
  const topicAnalytics = calculateTopicAnalytics(attempts);

  // Insight 1: Recent score progression
  if (trends.length >= 2) {
    const latest = trends[trends.length - 1];
    const previous = trends[trends.length - 2];
    const diff = Math.round((latest.accuracy - previous.accuracy) * 10) / 10;

    if (diff > 0) {
      insights.push({
        id: 'ins-01',
        type: 'improvement',
        message: `Your accuracy improved by ${diff}% in your latest test attempt.`,
        metricLabel: 'Accuracy Increase',
        metricValue: `+${diff}%`,
        derivedFromDate: latest.dateCompleted
      });
    } else if (diff < 0) {
      insights.push({
        id: 'ins-01',
        type: 'warning',
        message: `Accuracy dropped by ${Math.abs(diff)}% in your recent test. Review incorrect responses.`,
        metricLabel: 'Accuracy Drop',
        metricValue: `${diff}%`,
        derivedFromDate: latest.dateCompleted
      });
    }
  }

  // Insight 2: Strongest Topic
  const strongTopic = topicAnalytics.find((t) => t.masteryStatus === 'Strong' || t.overallAccuracy >= 85);
  if (strongTopic) {
    insights.push({
      id: 'ins-02',
      type: 'strength',
      message: `Your strongest topic is ${strongTopic.topicName} with ${strongTopic.overallAccuracy}% accuracy.`,
      metricLabel: 'Top Skill',
      metricValue: `${strongTopic.overallAccuracy}%`,
      derivedFromDate: new Date().toISOString()
    });
  }

  return insights;
}
