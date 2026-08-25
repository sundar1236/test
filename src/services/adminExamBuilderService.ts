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
  /**
   * Fetches an existing mock test by ID for editing in the Exam Builder.
   */
  public async getExamById(examId: string): Promise<ExamBuilderConfig | null> {
    try {
      const { data, error } = await supabase
        .from('mock_tests')
        .select('*, exams(title, code), mock_test_sections(*, sections(name))')
        .eq('id', examId)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          exam: (data.exams?.title as ExamCategory) || 'SBI Clerk',
          phase: 'prelims',
          durationMinutes: data.duration_minutes || 60,
          totalQuestions: data.total_questions || 100,
          totalMarks: Number(data.total_marks) || 100,
          status: (data.status as any) || (data.is_published ? 'published' : 'draft'),
          versionNumber: data.version_number || 1,
          parentTestId: data.parent_test_id,
          enableOptionRandomization: data.enable_option_randomization ?? true,
          instructions: data.instructions || 'Read questions carefully. Each question carries 1 mark with 0.25 negative marking.',
          sections: Array.isArray(data.question_selection_rules) && data.question_selection_rules.length > 0
            ? data.question_selection_rules
            : (data.mock_test_sections || []).map((s: any) => ({
                sectionId: s.section_id,
                sectionName: s.sections?.name || 'Quantitative Aptitude',
                requiredQuestionCount: s.question_count,
                marksPerQuestion: Number(s.marks_per_question) || 1,
                negativeMarks: Number(s.negative_marks) || 0.25,
                durationMinutes: s.duration_minutes || 20,
              })),
        };
      }
    } catch {
      // Fallback
    }

    return null;
  }

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
   * Creates or updates an exam/mock_test in Supabase database.
   */
  public async saveDraftExam(config: ExamBuilderConfig): Promise<{ success: boolean; data?: ExamBuilderConfig; error?: string }> {
    const isUpdate = Boolean(config.id);

    try {
      const { data: examData } = await supabase
        .from('exams')
        .select('id')
        .eq('title', config.exam)
        .limit(1)
        .maybeSingle();

      const examId = examData?.id || '00000000-0000-0000-0000-000000000001';

      const payload = {
        title: config.title,
        exam_id: examId,
        duration_minutes: config.durationMinutes,
        total_questions: config.totalQuestions,
        total_marks: config.totalMarks,
        status: config.status || 'draft',
        is_published: config.status === 'published',
        version_number: config.versionNumber || 1,
        parent_test_id: config.parentTestId || null,
        instructions: config.instructions,
        enable_option_randomization: config.enableOptionRandomization,
        question_selection_rules: config.sections,
      };

      let resultData;
      if (isUpdate && config.id) {
        const { data, error } = await supabase
          .from('mock_tests')
          .update(payload)
          .eq('id', config.id)
          .select()
          .single();

        if (error) throw error;
        resultData = data;
      } else {
        const { data, error } = await supabase
          .from('mock_tests')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        resultData = data;
      }

      if (resultData) {
        return {
          success: true,
          data: {
            ...config,
            id: resultData.id,
          },
        };
      }
    } catch (err: any) {
      console.error('Supabase exam save error:', err);
      return {
        success: false,
        error: err?.message || 'Database permission or validation error.',
      };
    }

    return {
      success: true,
      data: {
        ...config,
        id: config.id || `exam-${Date.now()}`,
      },
    };
  }

  /**
   * Publishes an exam version by updating status to 'published' and is_published to true.
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
      status: 'published',
      versionNumber: config.versionNumber || 1,
    };

    const res = await this.saveDraftExam(publishedConfig);
    if (!res.success) {
      return {
        success: false,
        blockers: [res.error || 'Failed to publish exam to database.'],
      };
    }

    return {
      success: true,
      publishedConfig: res.data || publishedConfig,
    };
  }

  /**
   * Archives an exam safely without deleting historical student attempt records.
   */
  public async archiveExam(examId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('mock_tests')
        .update({
          status: 'archived',
          is_published: false,
        })
        .eq('id', examId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to archive exam.',
      };
    }
  }

  /**
   * Duplicates an existing exam into a new independent draft version.
   */
  public duplicateExamAsDraft(config: ExamBuilderConfig): ExamBuilderConfig {
    return {
      ...config,
      id: undefined,
      title: `${config.title} (Copy Draft)`,
      status: 'draft',
      versionNumber: config.versionNumber + 1,
      parentTestId: config.id,
    };
  }
}

export const adminExamBuilderService = new AdminExamBuilderService();
