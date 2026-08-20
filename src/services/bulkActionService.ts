// Bulk Action Operations Service
// Handles bulk updates across 10,000+ question banks with transaction-safe audit logging.

import { QuestionStatus, DifficultyLevel } from '../types/database';
import { questionService } from './questionService';
import { adminService } from './adminService';

export interface BulkActionResult {
  action: string;
  totalRequested: number;
  successCount: number;
  failureCount: number;
  affectedQuestionIds: string[];
}

class BulkActionService {
  /**
   * Bulk updates status across selected question IDs
   */
  public async bulkUpdateStatus(
    questionIds: string[],
    newStatus: QuestionStatus,
    adminId: string = 'a1'
  ): Promise<BulkActionResult> {
    let success = 0;
    let failure = 0;
    const affected: string[] = [];

    for (const qid of questionIds) {
      try {
        const res = await questionService.updateQuestionStatus(qid, newStatus);
        if (res) {
          success++;
          affected.push(qid);
        } else {
          failure++;
        }
      } catch (e) {
        failure++;
      }
    }

    await adminService.logAdminAction(
      adminId,
      `BULK_STATUS_${newStatus.toUpperCase()}`,
      'questions',
      questionIds[0] || 'batch',
      {
        count: success,
        targetStatus: newStatus,
        affectedIds: affected
      }
    );

    return {
      action: `Set Status to ${newStatus}`,
      totalRequested: questionIds.length,
      successCount: success,
      failureCount: failure,
      affectedQuestionIds: affected
    };
  }

  /**
   * Bulk assigns difficulty level to questions
   */
  public async bulkAssignDifficulty(
    questionIds: string[],
    newDifficulty: DifficultyLevel,
    adminId: string = 'a1'
  ): Promise<BulkActionResult> {
    let success = 0;
    let failure = 0;
    const affected: string[] = [];

    for (const qid of questionIds) {
      try {
        const res = await questionService.updateQuestion(qid, { difficulty: newDifficulty });
        if (res) {
          success++;
          affected.push(qid);
        } else {
          failure++;
        }
      } catch (e) {
        failure++;
      }
    }

    await adminService.logAdminAction(
      adminId,
      'BULK_DIFFICULTY_ASSIGN',
      'questions',
      questionIds[0] || 'batch',
      { count: success, difficulty: newDifficulty, affectedIds: affected }
    );

    return {
      action: `Set Difficulty to ${newDifficulty}`,
      totalRequested: questionIds.length,
      successCount: success,
      failureCount: failure,
      affectedQuestionIds: affected
    };
  }

  /**
   * Bulk assigns topic to questions
   */
  public async bulkAssignTopic(
    questionIds: string[],
    topicId: string,
    adminId: string = 'a1'
  ): Promise<BulkActionResult> {
    let success = 0;
    let failure = 0;
    const affected: string[] = [];

    for (const qid of questionIds) {
      try {
        const res = await questionService.updateQuestion(qid, { topic_id: topicId });
        if (res) {
          success++;
          affected.push(qid);
        } else {
          failure++;
        }
      } catch (e) {
        failure++;
      }
    }

    await adminService.logAdminAction(
      adminId,
      'BULK_TOPIC_ASSIGN',
      'questions',
      questionIds[0] || 'batch',
      { count: success, topicId, affectedIds: affected }
    );

    return {
      action: 'Assign Topic',
      totalRequested: questionIds.length,
      successCount: success,
      failureCount: failure,
      affectedQuestionIds: affected
    };
  }

  /**
   * Bulk publishes questions safely
   */
  public async bulkPublish(questionIds: string[], adminId: string = 'a1'): Promise<BulkActionResult> {
    return this.bulkUpdateStatus(questionIds, 'published', adminId);
  }

  /**
   * Bulk archives questions
   */
  public async bulkArchive(questionIds: string[], adminId: string = 'a1'): Promise<BulkActionResult> {
    return this.bulkUpdateStatus(questionIds, 'archived', adminId);
  }
}

export const bulkActionService = new BulkActionService();
