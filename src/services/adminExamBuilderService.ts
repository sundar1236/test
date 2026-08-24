import { supabase } from '../lib/supabase';
import { Question, ExamCategory, UserRole } from '../types';
import { initialQuestions } from '../data/mockData';

export interface SectionRuleConfig {
  sectionId: string;
  sectionName: string;
  requiredQuestionCount: number;
  marksPerQuestion: number;
  negativeMarks: number;
  durationMinutes?: number;
  difficultyDistribution?: {
    easyPercent: number;
    moderatePercent: number;
    hardPercent: number;
  };
  topicFilters?: string[];
}

export interface ExamBuilderConfig {
  id?: string;
  title: string;
  exam: ExamCategory;
  phase: 'prelims' | 'mains';
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  status: 'draft' | 'validating' | 'ready' | 'published' | 'archived';
  versionNumber: number;
  parentTestId?: string;
  enableOptionRandomization: boolean;
  instructions: string;
  sections: SectionRuleConfig[];
}

export interface PoolValidationResult {
  isValid: boolean;
  blockers: string[];
  warnings: string[];
  sectionAvailability: Record<string, { required: number; available: number; gap: number }>;
}

export class AdminExamBuilderService {
  private localExamState: ExamBuilderConfig[] = [];

  /**
   * Evaluates question pool availability for an exam configuration.
   * Prevents publishing if available questions are less than required.
   */
  public async validatePoolAvailability(config: ExamBuilderConfig, allQuestions: Question[] = initialQuestions): Promise<PoolValidationResult> {
    const blockers: string[] = [];
    const warnings: string[] = [];
    const sectionAvailability: Record<string, { required: number; available: number; gap: number }> = {};

    let totalRequired = 0;

    for (const sec of config.sections) {
      totalRequired += sec.requiredQuestionCount;

      // Filter eligible published questions matching section and exam
      const eligible = allQuestions.filter((q) => {
        const matchesExam = !q.exam || q.exam === config.exam;
        const matchesSection = q.section === sec.sectionName || q.section === sec.sectionId;
        const isPublished = !q.status || q.status === 'published' || q.status === 'approved';
        return matchesExam && matchesSection && isPublished;
      });

      const availableCount = eligible.length;
      const gap = Math.max(0, sec.requiredQuestionCount - availableCount);

      sectionAvailability[sec.sectionName] = {
        required: sec.requiredQuestionCount,
        available: availableCount,
        gap,
      };

      if (gap > 0) {
        blockers.push(
          `Insufficient questions for section '${sec.sectionName}'. Required: ${sec.requiredQuestionCount}, Available: ${availableCount}, Shortage: ${gap}.`
        );
      }
    }

    if (totalRequired !== config.totalQuestions) {
      warnings.push(
        `Total question mismatch: Configured ${totalRequired} questions across sections, but total exam target is ${config.totalQuestions}.`
      );
    }

    if (config.durationMinutes < 10) {
      blockers.push('Exam duration must be at least 10 minutes.');
    }

    return {
      isValid: blockers.length === 0,
      blockers,
      warnings,
      sectionAvailability,
    };
  }

  /**
   * Creates or updates a draft exam.
   */
  public async saveDraftExam(config: ExamBuilderConfig): Promise<ExamBuilderConfig> {
    const savedConfig: ExamBuilderConfig = {
      ...config,
      id: config.id || `exam-${Date.now()}`,
      status: 'draft',
      versionNumber: config.versionNumber || 1,
    };

    try {
      const { data, error } = await supabase
        .from('mock_tests')
        .upsert({
          id: savedConfig.id,
          title: savedConfig.title,
          duration_minutes: savedConfig.durationMinutes,
          total_questions: savedConfig.totalQuestions,
          total_marks: savedConfig.totalMarks,
          status: 'draft',
          is_published: false,
          version_number: savedConfig.versionNumber,
          instructions: savedConfig.instructions,
          enable_option_randomization: savedConfig.enableOptionRandomization,
          question_selection_rules: savedConfig.sections,
        })
        .select()
        .single();

      if (!error && data) {
        savedConfig.id = data.id;
      }
    } catch {
      // Local fallback
    }

    const idx = this.localExamState.findIndex((e) => e.id === savedConfig.id);
    if (idx !== -1) {
      this.localExamState[idx] = savedConfig;
    } else {
      this.localExamState.push(savedConfig);
    }

    return savedConfig;
  }

  /**
   * Publishes an exam by creating an immutable published version.
   */
  public async publishExamVersion(config: ExamBuilderConfig, allQuestions: Question[] = initialQuestions): Promise<{ success: boolean; publishedConfig?: ExamBuilderConfig; blockers?: string[] }> {
    const poolCheck = await this.validatePoolAvailability(config, allQuestions);
    if (!poolCheck.isValid) {
      return {
        success: false,
        blockers: poolCheck.blockers,
      };
    }

    const publishedConfig: ExamBuilderConfig = {
      ...config,
      id: config.id || `exam-${Date.now()}`,
      status: 'published',
      versionNumber: config.versionNumber || 1,
    };

    try {
      await supabase.from('mock_tests').upsert({
        id: publishedConfig.id,
        title: publishedConfig.title,
        duration_minutes: publishedConfig.durationMinutes,
        total_questions: publishedConfig.totalQuestions,
        total_marks: publishedConfig.totalMarks,
        status: 'published',
        is_published: true,
        version_number: publishedConfig.versionNumber,
        instructions: publishedConfig.instructions,
        enable_option_randomization: publishedConfig.enableOptionRandomization,
        question_selection_rules: publishedConfig.sections,
      });
    } catch {
      // Local fallback
    }

    return {
      success: true,
      publishedConfig,
    };
  }

  /**
   * Duplicates an existing published exam into a new independent draft version.
   */
  public duplicateExamAsDraft(config: ExamBuilderConfig): ExamBuilderConfig {
    return {
      ...config,
      id: `exam-draft-${Date.now()}`,
      title: `${config.title} (Copy Draft)`,
      status: 'draft',
      versionNumber: config.versionNumber + 1,
      parentTestId: config.id,
    };
  }
}

export const adminExamBuilderService = new AdminExamBuilderService();
