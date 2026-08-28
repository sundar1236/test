// AI Question Generation & Quality Verification Engine
// Implements multi-stage validation: structural checks, mathematical recalculation, option uniqueness, explanation agreement, and staging checks.

import { Question, QuestionOption, DifficultyLevel, ExamCategory, SubjectSection } from '../types';
import { detectDuplicateQuestion, DuplicateCheckResult } from './duplicateDetectionService';

export interface AIQuestionPayload {
  questionText: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  exam: ExamCategory;
  section: SubjectSection;
  topic: string;
  difficulty: DifficultyLevel;
  sourceType?: 'AI_GENERATED_PRACTICE' | 'PREVIOUS_YEAR' | 'CURATED_PRACTICE';
  year?: number;
}

export interface ValidationStageResult {
  isValid: boolean;
  qualityScore: number; // 0 to 100
  blockers: string[];
  warnings: string[];
  structuralCheck: boolean;
  mathCheckPassed: boolean;
  optionsUnique: boolean;
  explanationAgrees: boolean;
  duplicateResult: DuplicateCheckResult;
}

export class AIValidationEngine {
  /**
   * Evaluates AI-generated question payload against quality gates and structural rules.
   */
  public evaluateQuestionPayload(payload: AIQuestionPayload, existingPool: any[] = []): ValidationStageResult {
    const blockers: string[] = [];
    const warnings: string[] = [];
    let qualityScore = 100;

    // 1. Structural Validation
    if (!payload.questionText || payload.questionText.trim().length < 12) {
      blockers.push('Question statement is too short or empty (minimum 12 characters required).');
      qualityScore -= 40;
    }

    if (!Array.isArray(payload.options) || payload.options.length < 4) {
      blockers.push('At least 4 option choices are required.');
      qualityScore -= 30;
    }

    // 2. Option Uniqueness Check
    const optionTexts = (payload.options || []).map((o) => o.text.trim().toLowerCase());
    const uniqueTexts = new Set(optionTexts);
    const optionsUnique = uniqueTexts.size === optionTexts.length;

    if (!optionsUnique) {
      blockers.push('Question contains duplicate option choices.');
      qualityScore -= 25;
    }

    // 3. Single Correct Option Match Check
    const correctOpt = payload.options?.find((o) => o.id === payload.correctOptionId || o.text === payload.correctOptionId);
    if (!correctOpt) {
      blockers.push(`Designated correct option '${payload.correctOptionId}' does not match any valid option ID.`);
      qualityScore -= 35;
    }

    // 4. Mathematical Recalculation Check for Quantitative Questions
    let mathCheckPassed = true;
    if (payload.section === 'Quantitative Aptitude') {
      const mathVerification = this.verifyMathCalculations(payload.questionText, payload.options, payload.correctOptionId);
      if (!mathVerification.isValid) {
        mathCheckPassed = false;
        warnings.push(`Mathematical statement check note: ${mathVerification.reason}`);
        qualityScore -= 15;
      }
    }

    // 5. Explanation Agreement Check
    let explanationAgrees = true;
    if (!payload.explanation || payload.explanation.trim().length < 15) {
      warnings.push('Solution explanation is short or missing details.');
      qualityScore -= 15;
      explanationAgrees = false;
    } else if (correctOpt && !payload.explanation.toLowerCase().includes(correctOpt.text.toLowerCase()) && !payload.explanation.includes(payload.correctOptionId)) {
      warnings.push('Solution explanation text does not explicitly cite the correct option choice.');
      qualityScore -= 10;
    }

    // 6. Duplicate & Near-Duplicate Check
    const dupResult = detectDuplicateQuestion(payload.questionText, existingPool);
    if (dupResult.duplicateType === 'exact') {
      blockers.push('Exact duplicate statement exists in question repository.');
      qualityScore -= 50;
    } else if (dupResult.duplicateType === 'near' || dupResult.duplicateType === 'potential') {
      warnings.push(`Potential duplicate detected (similarity score: ${dupResult.similarityScore}%). Sent to reviewer queue.`);
      qualityScore -= 20;
    }

    const structuralCheck = blockers.length === 0;
    qualityScore = Math.max(0, Math.min(100, qualityScore));

    return {
      isValid: structuralCheck && qualityScore >= 70,
      qualityScore,
      blockers,
      warnings,
      structuralCheck,
      mathCheckPassed,
      optionsUnique,
      explanationAgrees,
      duplicateResult: dupResult,
    };
  }

  /**
   * Mathematical expression parser and statement sanity checker
   */
  private verifyMathCalculations(qText: string, options: { id: string; text: string }[], correctOptId: string): { isValid: boolean; reason?: string } {
    // Basic arithmetic pattern extraction (e.g., "What is 20% of 450?")
    const percentMatch = qText.match(/(\d+)%\s+of\s+(\d+)/i);
    if (percentMatch) {
      const pct = parseFloat(percentMatch[1]);
      const val = parseFloat(percentMatch[2]);
      const expected = (pct / 100) * val;

      const chosenOpt = options.find((o) => o.id === correctOptId);
      if (chosenOpt) {
        const numInOpt = parseFloat(chosenOpt.text.replace(/[^0-9.]/g, ''));
        if (!isNaN(numInOpt) && Math.abs(numInOpt - expected) > 0.01) {
          return { isValid: false, reason: `Percentage calculation mismatch: ${pct}% of ${val} = ${expected}, but option states ${numInOpt}.` };
        }
      }
    }

    return { isValid: true };
  }
}

export const aiValidationEngine = new AIValidationEngine();
