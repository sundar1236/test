import { Question, PracticeSet, TestAttemptResult, ExamCategory, SubjectSection } from '../types';
import { initialQuestions } from '../data/mockData';

const PRACTICE_SETS_KEY = 'bank_clerk_practice_sets_v1';

export class PracticeService {
  /**
   * Generates a practice set composed exclusively of questions the student previously answered incorrectly.
   */
  public generateIncorrectQuestionsPracticeSet(
    attempts: TestAttemptResult[],
    examFilter?: ExamCategory,
    limit: number = 20
  ): PracticeSet {
    const incorrectQuestionIds = new Set<string>();

    attempts.forEach((attempt) => {
      if (examFilter && attempt.exam !== examFilter) return;
      if (!attempt.userAnswers) return;

      Object.entries(attempt.userAnswers).forEach(([qId, ansState]) => {
        // Find if user got this question wrong in this attempt
        const qMeta = attempt.questionsWithAnswers?.find((q) => q.id === qId);
        if (qMeta && qMeta.correctOptionId) {
          if (ansState.selectedOptionId && ansState.selectedOptionId !== qMeta.correctOptionId) {
            incorrectQuestionIds.add(qId);
          }
        }
      });
    });

    let eligibleQuestions = initialQuestions.filter((q) => incorrectQuestionIds.has(q.id));

    // Fallback to sample published questions if no stored incorrect questions
    if (eligibleQuestions.length === 0) {
      eligibleQuestions = initialQuestions.slice(0, Math.min(limit, initialQuestions.length));
    }

    const selectedQuestions = eligibleQuestions.slice(0, limit);

    return {
      id: `pset-inc-${Date.now()}`,
      title: 'Practice Incorrect Questions',
      description: 'Reattempt questions you previously answered incorrectly to reinforce correct concepts.',
      type: 'incorrect_questions',
      examFilter,
      questions: selectedQuestions,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Generates a practice set focused on weak topics identified from attempt analytics.
   */
  public generateWeakTopicsPracticeSet(
    weakTopicName: string,
    sectionName?: SubjectSection,
    limit: number = 15
  ): PracticeSet {
    let matchingQuestions = initialQuestions.filter(
      (q) => q.topic.toLowerCase().includes(weakTopicName.toLowerCase()) || q.topic === weakTopicName
    );

    if (matchingQuestions.length === 0 && sectionName) {
      matchingQuestions = initialQuestions.filter((q) => q.section === sectionName);
    }

    if (matchingQuestions.length === 0) {
      matchingQuestions = initialQuestions.slice(0, limit);
    }

    return {
      id: `pset-weak-${Date.now()}`,
      title: `Weak Topic Drill: ${weakTopicName}`,
      description: `Targeted practice set to raise accuracy in ${weakTopicName}.`,
      type: 'weak_topics',
      sectionFilter: sectionName,
      topicFilter: weakTopicName,
      questions: matchingQuestions.slice(0, limit),
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Saves a practice session result locally for student progress tracking.
   */
  public savePracticeSession(practiceSetId: string, score: number, totalQuestions: number): void {
    try {
      const existing = localStorage.getItem(PRACTICE_SETS_KEY);
      const records = existing ? JSON.parse(existing) : [];
      records.push({
        practiceSetId,
        score,
        totalQuestions,
        completedAt: new Date().toISOString()
      });
      localStorage.setItem(PRACTICE_SETS_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save practice session', e);
    }
  }
}

export const practiceService = new PracticeService();
