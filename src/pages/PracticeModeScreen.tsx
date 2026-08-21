import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Question, PracticeSet } from '../types';
import { practiceService } from '../services/practiceService';
import { attemptService } from '../services/attemptService';
import {
  BrainCircuit,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  BookOpen,
  Award
} from 'lucide-react';

export const PracticeModeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useApp();

  const typeParam = searchParams.get('type') || 'incorrect_questions';
  const topicParam = searchParams.get('topic') || '';

  const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  useEffect(() => {
    async function loadPracticeSet() {
      const attempts = await attemptService.getUserAttempts(user?.id || 'usr-student-1');

      let set: PracticeSet;
      if (typeParam === 'weak_topics' && topicParam) {
        set = practiceService.generateWeakTopicsPracticeSet(topicParam);
      } else {
        set = practiceService.generateIncorrectQuestionsPracticeSet(attempts);
      }
      setPracticeSet(set);
    }

    loadPracticeSet();
  }, [typeParam, topicParam, user?.id]);

  if (!practiceSet || practiceSet.questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center space-y-4 my-12">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto">
          <BrainCircuit className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-main)]">No Practice Questions Available</h2>
        <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
          Complete more mock tests to generate personalized practice sets for weak topics and incorrect questions.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-bold text-xs shadow-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion: Question = practiceSet.questions[currentIndex];
  const selectedOptId = selectedOptions[currentQuestion.id];
  const isRevealed = revealedAnswers[currentQuestion.id];

  const handleSelectOption = (optionId: string) => {
    if (isRevealed) return;
    setSelectedOptions((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
    setRevealedAnswers((prev) => ({ ...prev, [currentQuestion.id]: true }));
  };

  const calculateScore = () => {
    let correct = 0;
    practiceSet.questions.forEach((q) => {
      if (selectedOptions[q.id] === q.correctOptionId) {
        correct++;
      }
    });
    return correct;
  };

  const handleFinishSession = () => {
    const score = calculateScore();
    practiceService.savePracticeSession(practiceSet.id, score, practiceSet.questions.length);
    setSessionCompleted(true);
  };

  if (sessionCompleted) {
    const correctCount = calculateScore();
    const total = practiceSet.questions.length;
    const accuracy = Math.round((correctCount / total) * 100);

    return (
      <div className="max-w-2xl mx-auto p-6 sm:p-8 space-y-6 text-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-lg my-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-[var(--text-main)]">Practice Session Complete!</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">{practiceSet.title}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 py-2">
          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
            <span className="block text-2xl font-black text-emerald-600">{correctCount}</span>
            <span className="text-[11px] font-bold text-[var(--text-muted)]">Correct</span>
          </div>
          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
            <span className="block text-2xl font-black text-rose-500">{total - correctCount}</span>
            <span className="text-[11px] font-bold text-[var(--text-muted)]">Incorrect</span>
          </div>
          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
            <span className="block text-2xl font-black text-[#0F4C81] dark:text-[#38BDF8]">{accuracy}%</span>
            <span className="text-[11px] font-bold text-[var(--text-muted)]">Accuracy</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-left text-xs text-sky-900 dark:text-sky-200 space-y-1">
          <span className="font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" /> Practice Session Insight
          </span>
          <p>
            This practice set is untimed and does not modify your official mock test percentile or score records.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => {
              setSelectedOptions({});
              setRevealedAnswers({});
              setCurrentIndex(0);
              setSessionCompleted(false);
            }}
            className="flex-1 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-main)] font-bold text-xs hover:bg-[var(--bg-main)] flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Restart Session
          </button>
          <button
            onClick={() => navigate('/performance')}
            className="flex-1 py-3 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-black text-xs shadow-md"
          >
            View Full Analytics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 font-extrabold text-[10px] uppercase">
                Untimed Practice Mode
              </span>
              <span className="text-xs text-[var(--text-muted)] font-bold">
                Question {currentIndex + 1} of {practiceSet.questions.length}
              </span>
            </div>
            <h1 className="font-extrabold text-base sm:text-lg text-[var(--text-main)]">{practiceSet.title}</h1>
          </div>
        </div>

        <button
          onClick={handleFinishSession}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
        >
          Finish Practice
        </button>
      </div>

      {/* Main Question Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-6">
        <div className="flex items-center justify-between text-xs font-bold text-[var(--text-muted)] pb-2 border-b border-[var(--border-color)]">
          <span>{currentQuestion.exam} • {currentQuestion.section}</span>
          <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)]">
            Topic: {currentQuestion.topic}
          </span>
        </div>

        <div className="text-base sm:text-lg font-bold text-[var(--text-main)] leading-relaxed">
          {currentQuestion.questionText}
        </div>

        {/* Options */}
        <div className="space-y-3 pt-2">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOptId === opt.id;
            const isCorrectOpt = opt.id === currentQuestion.correctOptionId;

            let optionStyle =
              'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:border-[#0F4C81]';
            let badgeStyle = 'bg-[var(--bg-main)] text-[var(--text-main)] border-[var(--border-color)]';

            if (isRevealed) {
              if (isCorrectOpt) {
                optionStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold';
                badgeStyle = 'bg-emerald-600 text-white';
              } else if (isSelected && !isCorrectOpt) {
                optionStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 font-bold';
                badgeStyle = 'bg-rose-600 text-white';
              }
            } else if (isSelected) {
              optionStyle = 'border-[#0F4C81] bg-sky-50 dark:bg-sky-950/40 text-[#0F4C81] dark:text-sky-300 font-bold';
              badgeStyle = 'bg-[#0F4C81] text-white';
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                disabled={isRevealed}
                className={`w-full p-4 rounded-xl border-2 text-left text-sm font-medium transition-all flex items-center gap-3.5 ${optionStyle}`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-colors ${badgeStyle}`}>
                  {isRevealed && isCorrectOpt ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : isRevealed && isSelected && !isCorrectOpt ? (
                    <X className="w-4 h-4 stroke-[3]" />
                  ) : (
                    opt.id
                  )}
                </span>
                <span className="flex-1 leading-relaxed">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Step-by-Step Explanation Box */}
        {isRevealed && (
          <div className="p-5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 font-black text-xs text-[#0F4C81] dark:text-[#38BDF8] uppercase tracking-wide">
              <BookOpen className="w-4 h-4" /> Step-by-Step Solution Explanation
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed font-medium">
              {currentQuestion.explanation || 'Detailed solution step explanation available.'}
            </p>
          </div>
        )}

        {/* Bottom Pagination Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-main)] font-bold text-xs disabled:opacity-40 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {currentIndex < practiceSet.questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="px-5 py-2.5 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-black text-xs shadow-md flex items-center gap-1"
            >
              Next Question <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinishSession}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md"
            >
              Finish Practice Set
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
