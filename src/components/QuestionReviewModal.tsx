import React, { useState } from 'react';
import { Question, UserAnswerState } from '../types';
import { X, CheckCircle2, XCircle, HelpCircle, Bookmark, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

interface QuestionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  userAnswers: Record<string, UserAnswerState>;
  testTitle: string;
}

export const QuestionReviewModal: React.FC<QuestionReviewModalProps> = ({
  isOpen,
  onClose,
  questions,
  userAnswers,
  testTitle,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');

  if (!isOpen || questions.length === 0) return null;

  const currentQuestion = questions[currentIndex] || questions[0];
  const userAns = userAnswers[currentQuestion.id];

  const selectedOptId = userAns?.selectedOptionId;
  const correctOptId = currentQuestion.correctOptionId || 'A';

  const isAttempted = selectedOptId !== null && selectedOptId !== undefined;
  const isCorrect = isAttempted && (selectedOptId === correctOptId || selectedOptId.endsWith(correctOptId.replace('opt-', '')));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900/80">
          <div>
            <span className="text-[10px] font-black uppercase text-[#0F4C81] dark:text-[#38BDF8] tracking-wider">Solution & Explanation Review</span>
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 truncate max-w-xl">{testTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

          {/* Left Side: Question, User Choice & Detailed Explanation */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">

            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-[#0F4C81] dark:text-[#38BDF8]">Question {currentIndex + 1}</span>
                <span className="text-xs text-slate-400 font-semibold">• {currentQuestion.section} ({currentQuestion.topic})</span>
              </div>

              {/* Status Badge */}
              {isCorrect ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-extrabold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Correct (+1.0)
                </span>
              ) : isAttempted ? (
                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 font-extrabold text-xs flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> Incorrect (-0.25)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-extrabold text-xs flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" /> Unanswered (0.0)
                </span>
              )}
            </div>

            {/* Problem Statement */}
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
              {currentQuestion.questionText}
            </h2>

            {/* Options with Answer Key Highlights */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt) => {
                const optKey = opt.id.replace('opt-', '').toUpperCase();
                const isUserChoice = selectedOptId === opt.id || selectedOptId === optKey;
                const isCorrectOption = correctOptId === opt.id || correctOptId === optKey;

                let optStyle = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200';
                if (isCorrectOption) {
                  optStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold';
                } else if (isUserChoice && !isCorrect) {
                  optStyle = 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold';
                }

                return (
                  <div
                    key={opt.id}
                    className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${optStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                        {optKey}
                      </span>
                      <span>{opt.text}</span>
                    </div>

                    {isCorrectOption && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500 text-white uppercase">
                        Correct Answer
                      </span>
                    )}
                    {isUserChoice && !isCorrectOption && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-500 text-white uppercase">
                        Your Choice
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Comprehensive Explanation Box */}
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-[#0F4C81] dark:text-[#38BDF8]">
                <ShieldCheck className="w-4 h-4" /> Official Solution & Method
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {currentQuestion.explanation || 'Standard banking exam step-by-step formula and logic applies.'}
              </p>
            </div>

          </div>

          {/* Right Side: Jump Palette */}
          <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900/80 p-4 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0">
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-400 mb-3">Jump To Question</h4>
              <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const uA = userAnswers[q.id];
                  const qSelected = uA?.selectedOptionId;
                  const qCorrect = q.correctOptionId || 'A';
                  const qIsAttempted = qSelected !== null && qSelected !== undefined;
                  const qIsCorrect = qIsAttempted && (qSelected === qCorrect || qSelected.endsWith(qCorrect.replace('opt-', '')));

                  let btnStyle = 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
                  if (qIsCorrect) btnStyle = 'bg-emerald-500 text-white font-bold';
                  else if (qIsAttempted) btnStyle = 'bg-rose-500 text-white font-bold';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-8 rounded-lg text-xs flex items-center justify-center transition-all ${btnStyle} ${
                        idx === currentIndex ? 'ring-2 ring-[#0F4C81] ring-offset-2' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="flex-1 py-2 rounded-xl bg-[#0F4C81] text-white text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
