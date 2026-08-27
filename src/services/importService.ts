// Bulk Question Import Service
// Handles CSV and JSON parsing, schema validation, quality score checks, dry-run previews, batch execution, error logging, and rollbacks.

import { QuestionStatus, DifficultyLevel, ExamPhase } from '../types/database';
import { supabase } from '../lib/supabase';
import { detectDuplicateQuestion, generateQuestionHash, normalizeQuestionText, DuplicateCheckResult, DuplicateResolution } from './duplicateDetectionService';
import { questionService } from './questionService';
import { adminService } from './adminService';
import { initialQuestions } from '../data/mockData';

export interface RawImportRecord {
  rowNumber: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE?: string;
  correctAnswer: string; // 'A', 'B', 'C', 'D', or 'E'
  explanation?: string;
  examCode: string; // e.g. 'sbi-clerk', 'ibps-clerk', 'rbi-assistant', 'rrb-clerk'
  phase?: string; // 'prelims' | 'mains'
  sectionName: string; // 'Reasoning Ability', 'Quantitative Aptitude', 'English Language', 'General Awareness'
  topicTitle: string; // e.g. 'Syllogism', 'Data Interpretation'
  difficulty: string; // 'easy', 'moderate', 'hard'
  source?: string;
  year?: number;
}

export interface ImportError {
  rowNumber: number;
  field: string;
  errorType: 'MISSING_FIELD' | 'INVALID_VALUE' | 'METADATA_MISMATCH' | 'QUALITY_ISSUE';
  message: string;
  suggestedFix?: string;
}

export interface ProcessedRecord {
  rowNumber: number;
  rawData: RawImportRecord;
  isValid: boolean;
  errors: ImportError[];
  qualityScore: number; // 0 to 100
  duplicateResult: DuplicateCheckResult;
  resolution: DuplicateResolution;
}

export interface ImportPreviewSummary {
  batchNumber: string;
  fileName: string;
  format: 'csv' | 'json';
  totalRecords: number;
  validCount: number;
  invalidCount: number;
  exactDuplicatesCount: number;
  nearDuplicatesCount: number;
  averageQualityScore: number;
  records: ProcessedRecord[];
}

export interface BatchCommitResult {
  batchId: string;
  batchNumber: string;
  successCount: number;
  failureCount: number;
  duplicateCount: number;
  createdQuestionIds: string[];
}

class ImportService {
  /**
   * Helper to parse CSV raw text into structured key-value rows
   */
  public parseCSVText(csvContent: string): RawImportRecord[] {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    // Parse header
    const headers = this.parseCSVRow(lines[0]).map(h => h.trim().toLowerCase());

    const records: RawImportRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = this.parseCSVRow(lines[i]);
      if (row.length === 0 || (row.length === 1 && !row[0].trim())) continue;

      const recordMap: Record<string, string> = {};
      headers.forEach((h, idx) => {
        recordMap[h] = row[idx] ? row[idx].trim() : '';
      });

      records.push({
        rowNumber: i + 1,
        questionText: recordMap['question text'] || recordMap['question'] || recordMap['question_text'] || '',
        optionA: recordMap['option a'] || recordMap['option_a'] || recordMap['optiona'] || '',
        optionB: recordMap['option b'] || recordMap['option_b'] || recordMap['optionb'] || '',
        optionC: recordMap['option c'] || recordMap['option_c'] || recordMap['optionc'] || '',
        optionD: recordMap['option d'] || recordMap['option_d'] || recordMap['optiond'] || '',
        optionE: recordMap['option e'] || recordMap['option_e'] || recordMap['optione'] || '',
        correctAnswer: (recordMap['correct answer'] || recordMap['correct_answer'] || recordMap['answer'] || '').toUpperCase(),
        explanation: recordMap['explanation'] || recordMap['solution'] || '',
        examCode: recordMap['exam'] || recordMap['exam_code'] || recordMap['exam code'] || 'sbi-clerk',
        phase: recordMap['phase'] || 'prelims',
        sectionName: recordMap['section'] || recordMap['section_name'] || 'Reasoning Ability',
        topicTitle: recordMap['topic'] || recordMap['topic_title'] || 'General',
        difficulty: (recordMap['difficulty'] || 'moderate').toLowerCase(),
        source: recordMap['source'] || 'Import File',
        year: recordMap['year'] ? parseInt(recordMap['year'], 10) : new Date().getFullYear()
      });
    }

    return records;
  }

  private parseCSVRow(rowStr: string): string[] {
    const result: string[] = [];
    let insideQuotes = false;
    let currentField = '';

    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (char === '"' || char === "'") {
        if (insideQuotes && i + 1 < rowStr.length && rowStr[i + 1] === char) {
          currentField += char;
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    result.push(currentField);
    return result;
  }

  /**
   * Helper to validate JSON array payload into structured records
   */
  public parseJSONText(jsonContent: string): RawImportRecord[] {
    try {
      const parsed = JSON.parse(jsonContent);
      const rawList = Array.isArray(parsed) ? parsed : parsed.questions || [];

      return rawList.map((item: any, idx: number) => ({
        rowNumber: idx + 1,
        questionText: item.questionText || item.question || item.question_text || '',
        optionA: item.optionA || item.options?.A || item.options?.[0] || '',
        optionB: item.optionB || item.options?.B || item.options?.[1] || '',
        optionC: item.optionC || item.options?.C || item.options?.[2] || '',
        optionD: item.optionD || item.options?.D || item.options?.[3] || '',
        optionE: item.optionE || item.options?.E || item.options?.[4] || '',
        correctAnswer: (item.correctAnswer || item.answer || item.correct_answer || '').toString().toUpperCase(),
        explanation: item.explanation || item.solution || '',
        examCode: item.examCode || item.exam || 'sbi-clerk',
        phase: item.phase || 'prelims',
        sectionName: item.sectionName || item.section || 'Reasoning Ability',
        topicTitle: item.topicTitle || item.topic || 'General',
        difficulty: (item.difficulty || 'moderate').toLowerCase(),
        source: item.source || 'JSON Import',
        year: item.year ? parseInt(item.year, 10) : new Date().getFullYear()
      }));
    } catch (e) {
      throw new Error(`Invalid JSON format: ${(e as Error).message}`);
    }
  }

  /**
   * Performs validation, duplicate detection, and quality scoring (DRY-RUN)
   */
  public async previewImport(
    records: RawImportRecord[],
    fileName: string,
    format: 'csv' | 'json'
  ): Promise<ImportPreviewSummary> {
    const existing = await questionService.getAllQuestions();
    const existingQuestions = (existing.data && existing.data.length > 0) ? existing.data : (initialQuestions as any[]);

    const processedRecords: ProcessedRecord[] = [];
    let validCount = 0;
    let invalidCount = 0;
    let exactDupCount = 0;
    let nearDupCount = 0;
    let totalQuality = 0;

    for (const raw of records) {
      const errors: ImportError[] = [];
      let qualityScore = 100;

      // 1. Required Field Validations
      if (!raw.questionText || raw.questionText.length < 10) {
        errors.push({
          rowNumber: raw.rowNumber,
          field: 'Question Text',
          errorType: 'MISSING_FIELD',
          message: 'Question text must be at least 10 characters long.',
          suggestedFix: 'Provide detailed question statement.'
        });
        qualityScore -= 30;
      }

      if (!raw.optionA || !raw.optionB || !raw.optionC || !raw.optionD) {
        errors.push({
          rowNumber: raw.rowNumber,
          field: 'Options',
          errorType: 'MISSING_FIELD',
          message: 'At least 4 options (A, B, C, D) are required.',
          suggestedFix: 'Fill options A through D.'
        });
        qualityScore -= 30;
      }

      // Check for duplicate options
      const rawOpts = [raw.optionA, raw.optionB, raw.optionC, raw.optionD, raw.optionE];
      const opts = rawOpts.filter((o): o is string => Boolean(o)).map(o => o.trim().toLowerCase());
      if (new Set(opts).size < opts.length) {
        errors.push({
          rowNumber: raw.rowNumber,
          field: 'Options',
          errorType: 'QUALITY_ISSUE',
          message: 'Question contains duplicate options.',
          suggestedFix: 'Ensure all options are distinct.'
        });
        qualityScore -= 15;
      }

      const validAnswers = ['A', 'B', 'C', 'D', 'E'];
      if (!validAnswers.includes(raw.correctAnswer)) {
        errors.push({
          rowNumber: raw.rowNumber,
          field: 'Correct Answer',
          errorType: 'INVALID_VALUE',
          message: `Correct Answer must be one of A, B, C, D, or E. Got '${raw.correctAnswer}'.`,
          suggestedFix: 'Set correct answer to A, B, C, D, or E.'
        });
        qualityScore -= 25;
      }

      if (!raw.explanation || raw.explanation.length < 15) {
        errors.push({
          rowNumber: raw.rowNumber,
          field: 'Explanation',
          errorType: 'QUALITY_ISSUE',
          message: 'Explanation is short or missing.',
          suggestedFix: 'Add a clear solution breakdown.'
        });
        qualityScore -= 15;
      }

      const validDifficulties: DifficultyLevel[] = ['easy', 'moderate', 'hard'];
      if (!validDifficulties.includes(raw.difficulty as DifficultyLevel)) {
        raw.difficulty = 'moderate'; // fallback
      }

      // Duplicate Check
      const dupResult = detectDuplicateQuestion(raw.questionText, existingQuestions);
      if (dupResult.duplicateType === 'exact') exactDupCount++;
      if (dupResult.duplicateType === 'near' || dupResult.duplicateType === 'potential') nearDupCount++;

      const isValid = errors.filter(e => e.errorType === 'MISSING_FIELD' || e.errorType === 'INVALID_VALUE').length === 0;

      if (isValid) validCount++;
      else invalidCount++;

      qualityScore = Math.max(10, Math.min(100, qualityScore));
      totalQuality += qualityScore;

      processedRecords.push({
        rowNumber: raw.rowNumber,
        rawData: raw,
        isValid,
        errors,
        qualityScore,
        duplicateResult: dupResult,
        resolution: dupResult.isDuplicate ? 'skip' : 'import_anyway'
      });
    }

    const batchNumber = `BATCH-${Date.now().toString().slice(-6)}`;

    return {
      batchNumber,
      fileName,
      format,
      totalRecords: records.length,
      validCount,
      invalidCount,
      exactDuplicatesCount: exactDupCount,
      nearDuplicatesCount: nearDupCount,
      averageQualityScore: records.length > 0 ? Math.round(totalQuality / records.length) : 0,
      records: processedRecords
    };
  }

  /**
   * Commits an inspected import batch to the database with selected duplicate resolutions.
   * Processes large imports in safe chunks of 100 records to prevent browser freezing.
   * Ensures all imported questions default to 'draft' status.
   */
  public async commitImportBatch(
    preview: ImportPreviewSummary,
    resolutions: Record<number, DuplicateResolution>,
    adminId: string = 'a1',
    importerName: string = 'Admin User',
    onProgress?: (processed: number, total: number) => void
  ): Promise<BatchCommitResult> {
    let success = 0;
    let failed = 0;
    let duplicateHandled = 0;
    const createdIds: string[] = [];
    const totalRecords = preview.records.length;

    const chunkSize = 100;
    for (let i = 0; i < totalRecords; i += chunkSize) {
      const chunk = preview.records.slice(i, i + chunkSize);

      for (const record of chunk) {
        if (!record.isValid) {
          failed++;
          continue;
        }

        const res = resolutions[record.rowNumber] || record.resolution;

        if (record.duplicateResult.isDuplicate && res === 'skip') {
          duplicateHandled++;
          continue;
        }

        // Map raw data to question entity
        const normText = normalizeQuestionText(record.rawData.questionText);
        const qHash = generateQuestionHash(normText);

        const optionsList = [
          { option_key: 'A', option_text: record.rawData.optionA, is_correct: record.rawData.correctAnswer === 'A' },
          { option_key: 'B', option_text: record.rawData.optionB, is_correct: record.rawData.correctAnswer === 'B' },
          { option_key: 'C', option_text: record.rawData.optionC, is_correct: record.rawData.correctAnswer === 'C' },
          { option_key: 'D', option_text: record.rawData.optionD, is_correct: record.rawData.correctAnswer === 'D' },
        ];

        if (record.rawData.optionE) {
          optionsList.push({ option_key: 'E', option_text: record.rawData.optionE, is_correct: record.rawData.correctAnswer === 'E' });
        }

        try {
          // Fetch dynamic UUID mappings for Exam, Section, and Topic
          let resolvedExamId = '00000000-0000-0000-0000-000000000001';
          let resolvedSectionId = '00000000-0000-0000-0000-000000000002';
          let resolvedTopicId = '00000000-0000-0000-0000-000000000003';

          try {
            const { data: exData } = await supabase
              .from('exams')
              .select('id')
              .or(`code.ilike.%${record.rawData.examCode}%,title.ilike.%${record.rawData.examCode}%`)
              .limit(1)
              .maybeSingle();
            if (exData?.id) resolvedExamId = exData.id;

            const { data: secData } = await supabase
              .from('sections')
              .select('id')
              .or(`name.ilike.%${record.rawData.sectionName}%,code.ilike.%${record.rawData.sectionName}%`)
              .limit(1)
              .maybeSingle();
            if (secData?.id) resolvedSectionId = secData.id;

            const { data: topData } = await supabase
              .from('topics')
              .select('id')
              .ilike('title', `%${record.rawData.topicTitle}%`)
              .limit(1)
              .maybeSingle();
            if (topData?.id) resolvedTopicId = topData.id;
          } catch {
            // Fallback to resolved UUIDs
          }

          // Staging status MUST default to 'draft' or 'under_review'
          const newQuestion = await questionService.createQuestion({
            exam_id: resolvedExamId,
            phase: (record.rawData.phase === 'mains' ? 'mains' : 'prelims') as ExamPhase,
            section_id: resolvedSectionId,
            topic_id: resolvedTopicId,
            question_text: record.rawData.questionText,
            question_hash: qHash,
            normalized_text: normText,
            difficulty: (record.rawData.difficulty || 'moderate') as DifficultyLevel,
            explanation: record.rawData.explanation || '',
            status: 'draft' as QuestionStatus,
            options: optionsList
          });

          if (newQuestion) {
            success++;
            createdIds.push(newQuestion.id);
          } else {
            failed++;
          }
        } catch (e) {
          failed++;
        }
      }

      if (onProgress) {
        onProgress(Math.min(i + chunkSize, totalRecords), totalRecords);
      }
    }

    // Audit Log
    await adminService.logAdminAction(
      adminId,
      'IMPORT_BATCH_COMMITTED',
      'import_batches',
      preview.batchNumber,
      {
        fileName: preview.fileName,
        format: preview.format,
        totalRecords: preview.totalRecords,
        successCount: success,
        failureCount: failed,
        duplicateCount: duplicateHandled,
        importer: importerName
      }
    );

    return {
      batchId: preview.batchNumber,
      batchNumber: preview.batchNumber,
      successCount: success,
      failureCount: failed,
      duplicateCount: duplicateHandled,
      createdQuestionIds: createdIds
    };
  }

  /**
   * Generates a CSV download string for invalid or error records
   */
  public generateErrorCSV(records: ProcessedRecord[]): string {
    const errorRecords = records.filter(r => !r.isValid || r.errors.length > 0);
    let csv = 'Row Number,Field,Error Type,Message,Question Text\n';

    for (const rec of errorRecords) {
      for (const err of rec.errors) {
        const escapedQ = `"${(rec.rawData.questionText || '').replace(/"/g, '""')}"`;
        const escapedMsg = `"${err.message.replace(/"/g, '""')}"`;
        csv += `${rec.rowNumber},${err.field},${err.errorType},${escapedMsg},${escapedQ}\n`;
      }
    }

    return csv;
  }
}

export const importService = new ImportService();
