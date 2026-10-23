import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  determineMasteryStatus,
  MINIMUM_TOPIC_SAMPLE_SIZE,
  calculateDashboardStats,
  calculatePerformanceTrends,
  calculateSectionAnalytics,
  calculateTopicAnalytics,
  calculateTimeAnalytics,
  compareAttempts,
  generateLearningRecommendations,
  generatePerformanceInsights
} from '../src/services/analyticsEngine.ts';
import type { TestAttemptResult } from '../src/types/index.ts';

describe('determineMasteryStatus', () => {
  it('should return "Not Started" when totalAttempted is 0', () => {
    assert.equal(determineMasteryStatus(100, 0), 'Not Started');
    assert.equal(determineMasteryStatus(0, 0), 'Not Started');
  });

  it('should return "Learning" when totalAttempted is below MINIMUM_TOPIC_SAMPLE_SIZE (5)', () => {
    assert.equal(MINIMUM_TOPIC_SAMPLE_SIZE, 5);
    assert.equal(determineMasteryStatus(100, 1), 'Learning');
    assert.equal(determineMasteryStatus(100, 4), 'Learning');
    assert.equal(determineMasteryStatus(0, 4), 'Learning');
  });

  it('should return "Strong" when accuracy >= 85 and totalAttempted >= 10', () => {
    // Exact threshold boundary
    assert.equal(determineMasteryStatus(85, 10), 'Strong');
    assert.equal(determineMasteryStatus(100, 10), 'Strong');
    assert.equal(determineMasteryStatus(90, 15), 'Strong');
  });

  it('should return "Improving" when accuracy >= 85 but totalAttempted < 10 (and >= 5)', () => {
    // 85% accuracy with 5..9 questions falls through to accuracy >= 72 check -> 'Improving'
    assert.equal(determineMasteryStatus(85, 5), 'Improving');
    assert.equal(determineMasteryStatus(100, 9), 'Improving');
  });

  it('should return "Improving" when accuracy >= 72 and < 85 with totalAttempted >= 5', () => {
    // Boundary checks for 72%
    assert.equal(determineMasteryStatus(72, 5), 'Improving');
    assert.equal(determineMasteryStatus(72, 10), 'Improving');
    assert.equal(determineMasteryStatus(84.9, 10), 'Improving');
  });

  it('should return "Needs Practice" when accuracy >= 55 and < 72 with totalAttempted >= 5', () => {
    // Boundary checks for 55%
    assert.equal(determineMasteryStatus(55, 5), 'Needs Practice');
    assert.equal(determineMasteryStatus(55, 20), 'Needs Practice');
    assert.equal(determineMasteryStatus(71.9, 10), 'Needs Practice');
  });

  it('should return "Needs Practice" when accuracy < 55 with totalAttempted >= 5', () => {
    assert.equal(determineMasteryStatus(54.9, 5), 'Needs Practice');
    assert.equal(determineMasteryStatus(0, 5), 'Needs Practice');
    assert.equal(determineMasteryStatus(30, 12), 'Needs Practice');
  });
});

describe('calculateDashboardStats', () => {
  it('should return default stats when attempts list is empty or null', () => {
    const defaultStats = {
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
    assert.deepEqual(calculateDashboardStats([]), defaultStats);
    assert.deepEqual(calculateDashboardStats(null as any), defaultStats);
  });

  it('should accurately aggregate statistics across multiple attempts', () => {
    const attempts: TestAttemptResult[] = [
      {
        attemptId: 'att-1',
        testId: 't-1',
        testTitle: 'Test 1',
        exam: 'SBI Clerk',
        dateCompleted: '2025-01-01T10:00:00Z',
        timeSpentSeconds: 1200,
        totalQuestions: 30,
        attemptedQuestions: 25,
        correctAnswers: 20,
        wrongAnswers: 5,
        skippedQuestions: 5,
        score: 18.75,
        maxScore: 30,
        accuracy: 80,
        percentile: 85,
        sectionBreakdown: {},
        topicBreakdown: {},
        userAnswers: {}
      },
      {
        attemptId: 'att-2',
        testId: 't-2',
        testTitle: 'Test 2',
        exam: 'SBI Clerk',
        dateCompleted: '2025-01-02T10:00:00Z',
        timeSpentSeconds: 1800,
        totalQuestions: 30,
        attemptedQuestions: 25,
        correctAnswers: 15,
        wrongAnswers: 10,
        skippedQuestions: 5,
        score: 12.5,
        maxScore: 30,
        accuracy: 60,
        percentile: 70,
        sectionBreakdown: {},
        topicBreakdown: {},
        userAnswers: {}
      }
    ];

    const stats = calculateDashboardStats(attempts);
    assert.equal(stats.totalTestsAttempted, 2);
    assert.equal(stats.completedTests, 2);
    assert.equal(stats.avgScore, 15.6); // (18.75 + 12.5) / 2 = 15.625 -> Math.round(15.625*10)/10 = 15.6
    assert.equal(stats.avgAccuracy, 70); // (80 + 60) / 2 = 70
    assert.equal(stats.bestScore, 18.75);
    assert.equal(stats.questionsAttempted, 50);
    assert.equal(stats.correctAnswers, 35);
    assert.equal(stats.incorrectAnswers, 15);
    assert.equal(stats.unansweredQuestions, 10);
    assert.equal(stats.avgTimePerQuestionSeconds, 60); // (1200 + 1800) / 50 = 3000 / 50 = 60
  });
});

describe('calculatePerformanceTrends', () => {
  const attempts: TestAttemptResult[] = [
    {
      attemptId: 'att-2',
      testId: 't-2',
      testTitle: 'Test 2',
      exam: 'SBI Clerk',
      phase: 'mains',
      dateCompleted: '2025-01-05T10:00:00Z',
      timeSpentSeconds: 1800,
      totalQuestions: 30,
      attemptedQuestions: 25,
      correctAnswers: 20,
      wrongAnswers: 5,
      skippedQuestions: 5,
      score: 20,
      maxScore: 30,
      accuracy: 80,
      percentile: 85,
      sectionBreakdown: {},
      topicBreakdown: {},
      userAnswers: {}
    },
    {
      attemptId: 'att-1',
      testId: 't-1',
      testTitle: 'Test 1',
      exam: 'IBPS Clerk',
      phase: 'prelims',
      dateCompleted: '2025-01-01T10:00:00Z',
      timeSpentSeconds: 1200,
      totalQuestions: 30,
      attemptedQuestions: 20,
      correctAnswers: 15,
      wrongAnswers: 5,
      skippedQuestions: 10,
      score: 15,
      maxScore: 30,
      accuracy: 75,
      percentile: 70,
      sectionBreakdown: {},
      topicBreakdown: {},
      userAnswers: {}
    }
  ];

  it('should sort attempts chronologically ascending', () => {
    const trends = calculatePerformanceTrends(attempts);
    assert.equal(trends.length, 2);
    assert.equal(trends[0].attemptId, 'att-1');
    assert.equal(trends[1].attemptId, 'att-2');
  });

  it('should filter by exam and phase', () => {
    const filteredExam = calculatePerformanceTrends(attempts, 'IBPS Clerk');
    assert.equal(filteredExam.length, 1);
    assert.equal(filteredExam[0].attemptId, 'att-1');

    const filteredPhase = calculatePerformanceTrends(attempts, 'all', 'mains');
    assert.equal(filteredPhase.length, 1);
    assert.equal(filteredPhase[0].attemptId, 'att-2');
  });
});

describe('calculateSectionAnalytics', () => {
  it('should aggregate section performance levels correctly', () => {
    const attempts: TestAttemptResult[] = [
      {
        attemptId: 'att-1',
        testId: 't-1',
        testTitle: 'Test 1',
        exam: 'SBI Clerk',
        dateCompleted: '2025-01-01T10:00:00Z',
        timeSpentSeconds: 1200,
        totalQuestions: 30,
        attemptedQuestions: 25,
        correctAnswers: 20,
        wrongAnswers: 5,
        skippedQuestions: 5,
        score: 20,
        maxScore: 30,
        accuracy: 80,
        percentile: 80,
        sectionBreakdown: {
          'Quantitative Aptitude': {
            sectionId: 'sec-1',
            sectionName: 'Quantitative Aptitude',
            totalQuestions: 10,
            attempted: 10,
            correct: 9,
            incorrect: 1,
            skipped: 0,
            score: 8.75,
            maxScore: 10,
            accuracy: 90
          },
          'Reasoning Ability': {
            sectionId: 'sec-2',
            sectionName: 'Reasoning Ability',
            totalQuestions: 10,
            attempted: 10,
            correct: 4,
            incorrect: 6,
            skipped: 0,
            score: 2.5,
            maxScore: 10,
            accuracy: 40
          }
        },
        topicBreakdown: {},
        userAnswers: {}
      }
    ];

    const analytics = calculateSectionAnalytics(attempts);
    assert.equal(analytics.length, 2);

    const quant = analytics.find((s) => s.sectionName === 'Quantitative Aptitude');
    assert.ok(quant);
    assert.equal(quant?.accuracy, 90);
    assert.equal(quant?.performanceLevel, 'High');

    const reasoning = analytics.find((s) => s.sectionName === 'Reasoning Ability');
    assert.ok(reasoning);
    assert.equal(reasoning?.accuracy, 40);
    assert.equal(reasoning?.performanceLevel, 'Weak');
  });
});

describe('calculateTopicAnalytics', () => {
  it('should calculate topic metrics and recent accuracy', () => {
    const attempts: TestAttemptResult[] = [
      {
        attemptId: 'att-1',
        testId: 't-1',
        testTitle: 'Test 1',
        exam: 'SBI Clerk',
        dateCompleted: '2025-01-01T10:00:00Z',
        timeSpentSeconds: 1200,
        totalQuestions: 10,
        attemptedQuestions: 10,
        correctAnswers: 8,
        wrongAnswers: 2,
        skippedQuestions: 0,
        score: 8,
        maxScore: 10,
        accuracy: 80,
        percentile: 80,
        sectionBreakdown: {},
        topicBreakdown: {
          'Quantitative Aptitude:Simplification': {
            total: 5,
            correct: 5,
            accuracy: 100
          }
        },
        userAnswers: {}
      },
      {
        attemptId: 'att-2',
        testId: 't-2',
        testTitle: 'Test 2',
        exam: 'SBI Clerk',
        dateCompleted: '2025-01-02T10:00:00Z',
        timeSpentSeconds: 1200,
        totalQuestions: 10,
        attemptedQuestions: 10,
        correctAnswers: 8,
        wrongAnswers: 2,
        skippedQuestions: 0,
        score: 8,
        maxScore: 10,
        accuracy: 80,
        percentile: 80,
        sectionBreakdown: {},
        topicBreakdown: {
          'Quantitative Aptitude:Simplification': {
            total: 5,
            correct: 4,
            accuracy: 80
          }
        },
        userAnswers: {}
      }
    ];

    const topics = calculateTopicAnalytics(attempts);
    assert.equal(topics.length, 1);
    const simplification = topics[0];
    assert.equal(simplification.topicName, 'Simplification');
    assert.equal(simplification.sectionName, 'Quantitative Aptitude');
    assert.equal(simplification.attemptedQuestions, 10);
    assert.equal(simplification.correctAnswers, 9);
    assert.equal(simplification.overallAccuracy, 90);
    assert.equal(simplification.recentAccuracy, 90); // Math.round((100 + 80) / 2) = 90
    assert.equal(simplification.sampleSizeValid, true);
    assert.equal(simplification.masteryStatus, 'Strong'); // accuracy 90 >= 85 and total 10 >= 10
  });
});

describe('calculateTimeAnalytics', () => {
  it('should return default recommendations if attempts are empty', () => {
    const result = calculateTimeAnalytics([]);
    assert.equal(result.avgTimePerQuestionSeconds, 0);
    assert.equal(result.timeEfficiencyLevel, 'Acceptable');
  });

  it('should compute pacing metrics and efficiency levels', () => {
    const attempts: TestAttemptResult[] = [
      {
        attemptId: 'att-1',
        testId: 't-1',
        testTitle: 'Test 1',
        exam: 'SBI Clerk',
        dateCompleted: '2025-01-01T10:00:00Z',
        timeSpentSeconds: 600,
        totalQuestions: 20,
        attemptedQuestions: 20,
        correctAnswers: 15,
        wrongAnswers: 5,
        skippedQuestions: 0,
        score: 13.75,
        maxScore: 20,
        accuracy: 75,
        percentile: 80,
        sectionBreakdown: {},
        topicBreakdown: {},
        userAnswers: {
          q1: { questionId: 'q1', selectedOptionId: 'opt1', status: 'answered', timeSpentSeconds: 12 },
          q2: { questionId: 'q2', selectedOptionId: 'opt1', status: 'answered', timeSpentSeconds: 80 }
        }
      }
    ];

    const timeAnalytics = calculateTimeAnalytics(attempts);
    assert.equal(timeAnalytics.avgTimePerQuestionSeconds, 30); // 600 / 20 = 30
    assert.equal(timeAnalytics.timeEfficiencyLevel, 'Optimal'); // <= 36
    assert.equal(timeAnalytics.fastestQuestionSeconds, 12);
    assert.equal(timeAnalytics.slowestQuestionSeconds, 80);
  });
});

describe('compareAttempts', () => {
  it('should compute differences between two test attempts', () => {
    const attemptA: TestAttemptResult = {
      attemptId: 'att-1',
      testId: 't-1',
      testTitle: 'Test 1',
      exam: 'SBI Clerk',
      dateCompleted: '2025-01-01T10:00:00Z',
      timeSpentSeconds: 1200,
      totalQuestions: 20,
      attemptedQuestions: 20,
      correctAnswers: 12,
      wrongAnswers: 8,
      skippedQuestions: 0,
      score: 10,
      maxScore: 20,
      accuracy: 60,
      percentile: 65,
      sectionBreakdown: {},
      topicBreakdown: {},
      userAnswers: {}
    };

    const attemptB: TestAttemptResult = {
      attemptId: 'att-2',
      testId: 't-2',
      testTitle: 'Test 2',
      exam: 'SBI Clerk',
      dateCompleted: '2025-01-02T10:00:00Z',
      timeSpentSeconds: 1100,
      totalQuestions: 20,
      attemptedQuestions: 20,
      correctAnswers: 16,
      wrongAnswers: 4,
      skippedQuestions: 0,
      score: 15,
      maxScore: 20,
      accuracy: 80,
      percentile: 85,
      sectionBreakdown: {},
      topicBreakdown: {},
      userAnswers: {}
    };

    const comparison = compareAttempts(attemptA, attemptB);
    assert.equal(comparison.scoreDiff, 5);
    assert.equal(comparison.accuracyDiff, 20);
    assert.equal(comparison.correctDiff, 4);
    assert.equal(comparison.wrongDiff, -4);
    assert.equal(comparison.timeSpentDiffSeconds, -100);
    assert.equal(comparison.percentileDiff, 20);
    assert.equal(comparison.isImprovement, true);
  });
});

describe('generateLearningRecommendations & Insights', () => {
  it('should return default recommendation when no attempts exist', () => {
    const recs = generateLearningRecommendations([]);
    assert.equal(recs.length, 1);
    assert.equal(recs[0].type, 'weak_topic');

    const insights = generatePerformanceInsights([]);
    assert.deepEqual(insights, []);
  });
});
