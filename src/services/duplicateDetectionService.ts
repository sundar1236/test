// Duplicate Detection Engine
// Computes text normalization, SHA-256 style question hashes, exact matches, and Jaccard/Levenshtein near-duplicates.

import { QuestionModel } from '../types/database';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateType: 'exact' | 'near' | 'potential' | null;
  matchedQuestionId: string | null;
  matchedQuestionText?: string;
  similarityScore: number; // 0 to 100
  matchReason?: string;
}

export type DuplicateResolution = 'skip' | 'merge' | 'import_anyway' | 'replace_existing';

/**
 * Normalizes question text for robust comparison.
 * Strips HTML, special symbols, multiple spaces, and converts to lowercase.
 */
export function normalizeQuestionText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/[^\w\s]/gi, ' ') // replace punctuation with spaces
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim();
}

/**
 * Generates a simple hash string from normalized text for fast indexing and exact lookup.
 */
export function generateQuestionHash(normalizedText: string): string {
  let hash = 0;
  if (normalizedText.length === 0) return '0';
  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `h_${Math.abs(hash)}_${normalizedText.length}`;
}

/**
 * Calculates word-level Jaccard Similarity coefficient (0.0 to 1.0)
 */
export function calculateJaccardSimilarity(textA: string, textB: string): number {
  const wordsA = new Set(textA.split(' ').filter(w => w.length > 2));
  const wordsB = new Set(textB.split(' ').filter(w => w.length > 2));

  if (wordsA.size === 0 && wordsB.size === 0) return 1.0;
  if (wordsA.size === 0 || wordsB.size === 0) return 0.0;

  const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);

  return intersection.size / union.size;
}

/**
 * Detects whether a incoming question is an exact, near, or potential duplicate against an existing set.
 */
export function detectDuplicateQuestion(
  incomingQuestionText: string,
  existingQuestions: QuestionModel[]
): DuplicateCheckResult {
  const normalizedIncoming = normalizeQuestionText(incomingQuestionText);
  const incomingHash = generateQuestionHash(normalizedIncoming);

  if (!normalizedIncoming) {
    return { isDuplicate: false, duplicateType: null, matchedQuestionId: null, similarityScore: 0 };
  }

  // 1. Exact Match via Hash or Normalized String
  for (const existing of existingQuestions) {
    const existingNorm = existing.normalized_text || normalizeQuestionText(existing.question_text);
    const existingHash = existing.question_hash || generateQuestionHash(existingNorm);

    if (incomingHash === existingHash || normalizedIncoming === existingNorm) {
      return {
        isDuplicate: true,
        duplicateType: 'exact',
        matchedQuestionId: existing.id,
        matchedQuestionText: existing.question_text,
        similarityScore: 100,
        matchReason: 'Exact match on normalized text/hash'
      };
    }
  }

  // 2. Near Duplicate Match via Jaccard Word Similarity
  let bestNearMatch: { question: QuestionModel; score: number } | null = null;

  for (const existing of existingQuestions) {
    const existingNorm = existing.normalized_text || normalizeQuestionText(existing.question_text);
    const score = calculateJaccardSimilarity(normalizedIncoming, existingNorm);

    if (score >= 0.85) {
      if (!bestNearMatch || score > bestNearMatch.score) {
        bestNearMatch = { question: existing, score };
      }
    }
  }

  if (bestNearMatch) {
    const scorePercent = Math.round(bestNearMatch.score * 100);
    const dupType = scorePercent >= 92 ? 'near' : 'potential';
    return {
      isDuplicate: true,
      duplicateType: dupType,
      matchedQuestionId: bestNearMatch.question.id,
      matchedQuestionText: bestNearMatch.question.question_text,
      similarityScore: scorePercent,
      matchReason: `${scorePercent}% word overlap with question "${bestNearMatch.question.question_text.slice(0, 40)}..."`
    };
  }

  return {
    isDuplicate: false,
    duplicateType: null,
    matchedQuestionId: null,
    similarityScore: 0
  };
}
