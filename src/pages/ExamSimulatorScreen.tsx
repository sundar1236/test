import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserAnswerState, SecureExamQuestion, MockTestMeta } from '../types';
import { attemptService } from '../services/attemptService';
import { useExamTimer } from '../hooks/useExamTimer';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Send,
  AlertCircle,
  ShieldCheck,
  Grid,
  X,
  CheckCircle2,
  HelpCircle,
  Check
} from 'lucide-react';

export const ExamSimulatorScreen: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { bookmarks, toggleBookmark } = useApp();

  const [loading, setLoading] = useState<boolean>(true);
  const [testMeta, setTestMeta] = useState<MockTestMeta | null>(null);
  const [questions, setQuestions] = useState<SecureExamQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string>('');
  const [startedAtMs, setStartedAtMs] = useState<number>(Date.now());
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [answersMap, setAnswersMap] = useState<Record<string, UserAnswerState>>({});

  const [activeSectionName, setActiveSectionName] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showMobilePalette, setShowMobilePalette] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const currentTestId = testId || 'test-sbi-clerk-full-01';
    let isMounted = true;

    async function initExam() {
      try {
        setLoading(true);
        const attemptData = await attemptService.startAttempt(currentTestId);
        if (!isMounted) return;

        setTestMeta(attemptData.testMeta);
        setQuestions(attemptData.questions);
        setAttemptId(attemptData.attemptId);
        setStartedAtMs(attemptData.startedAtMs);
        setDurationMinutes(attemptData.durationMinutes);
        setAnswersMap(attemptData.userAnswers);

        if (attemptData.questions.length > 0) {
          const firstSec = attemptData.questions[0].sectionName;
          setActiveSectionName(firstSec);
        }
      } catch (err) {
        console.error('Failed to initialize test attempt', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initExam();
    return () => {
      isMounted = false;
    };
  }, [testId]);

  const handleFinalSubmission = useCallback(
    async (isTimeoutTrigger: boolean = false) => {
      const activeTestId = testId || testMeta?.id || 'test-sbi-clerk-full-01';
      if (isSubmitting || !testMeta || !attemptId || !activeTestId) return;
      setIsSubmitting(true);

      if (isTimeoutTrigger) {
        setNotification('Time expired. Your test has been automatically submitted.');
      }

      try {
        const timeSpent = Math.max(1, Math.floor((Date.now() - startedAtMs) / 1000));
        const result = await attemptService.submitAttempt(
          activeTestId,
          'usr-student-1',
          attemptId,
          answersMap,
          testMeta,
          timeSpent
        );

        setTimeout(() => {
          navigate(`/results/${activeTestId}`, { state: { result } });
        }, 1200);
      } catch (e) {
        console.error('Error submitting test', e);
        setIsSubmitting(false);
      }
    },
    [isSubmitting, testMeta, attemptId, testId, startedAtMs, answersMap, navigate]
  );

  const { formattedTime } = useExamTimer({
    durationMinutes,
    startedAtMs,
    onTimerExpire: () => handleFinalSubmission(true),
    isPaused: loading || isSubmitting,
  });

  const sectionsList = useMemo(() => {
    const secSet = new Set<string>();
    questions.forEach((q) => secSet.add(q.sectionName));
    return Array.from(secSet);
  }, [questions]);

  const sectionQuestions = useMemo(() => {
    return questions.filter((q) => q.sectionName === activeSectionName);
  }, [questions, activeSectionName]);

  const currentQuestion = sectionQuestions[currentQuestionIndex] || questions[0];

  useEffect(() => {
    const activeTestId = testId || testMeta?.id || 'test-sbi-clerk-full-01';
    if (currentQuestion && answersMap[currentQuestion.id]?.status === 'not_visited') {
      const updated: UserAnswerState = {
        ...answersMap[currentQuestion.id],
        status: 'not_answered',
      };
      setAnswersMap((prev) => ({ ...prev, [currentQuestion.id]: updated }));
      if (activeTestId && attemptId) {
        attemptService.updateAnswer(activeTestId, 'usr-student-1', attemptId, updated);
      }
    }
  }, [currentQuestion, testId, testMeta, attemptId, answersMap]);

  const handleSelectOption = (optionId: string) => {
    const activeTestId = testId || testMeta?.id || 'test-sbi-clerk-full-01';
    if (!currentQuestion) return;
    const existing = answersMap[currentQuestion.id] || {
      questionId: currentQuestion.id,
      selectedOptionId: null,
      status: 'not_visited',
      timeSpentSeconds: 0,
    };

    const updated: UserAnswerState = {
      ...existing,
      selectedOptionId: optionId,
    };

    setAnswersMap((prev) => ({ ...prev, [currentQuestion.id]: updated }));
    if (activeTestId && attemptId) {
      attemptService.updateAnswer(activeTestId, 'usr-student-1', attemptId, updated);
    }
  };

  const handleSaveAndNext = () => {
    const activeTestId = testId || testMeta?.id || 'test-sbi-clerk-full-01';
    if (!currentQuestion) return;
    const existing = answersMap[currentQuestion.id];
    const newStatus = existing?.selectedOptionId ? 'answered' : 'not_answered';

    const updated: UserAnswerState = {
      ...existing,
      status: newStatus,
    };

    setAnswersMap((prev) => ({ ...prev, [currentQuestion.id]: updated }));
    if (activeTestId && attemptId) {
      attemptService.updateAnswer(activeTestId, 'usr-student-1', attemptId, updated);
    }

    if (currentQuestionIndex < sectionQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleMarkForReview = () => {
    const activeTestId = testId || testMeta?.id || 'test-sbi-clerk-full-01';
    if (!currentQuestion) return;
    const existing = answersMap[currentQuestion.id];
    const updated: UserAnswerState = {
      ...existing,
      status: 'marked_for_review',
    };

    setAnswersMap((prev) => ({ ...prev, [currentQuestion.id]: updated }));
    if (activeTestId && attemptId) {
      attemptService.updateAnswer(activeTestId, 'usr-student-1', attemptId, updated);
    }

    if (currentQuestionIndex < sectionQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleClearResponse = () => {
    const activeTestId = testId || testMeta?.id || 'test-sbi-clerk-full-01';
    if (!currentQuestion) return;
    const existing = answersMap[currentQuestion.id];
    const updated: UserAnswerState = {
      ...existing,
      selectedOptionId: null,
      status: 'not_answered',
    };

    setAnswersMap((prev) => ({ ...prev, [currentQuestion.id]: updated }));
    if (activeTestId && attemptId) {
      attemptService.updateAnswer(activeTestId, 'usr-student-1', attemptId, updated);
    }
  };

  const paletteCounts = useMemo(() => {
    let answered = 0;
    let notAnswered = 0;
    let marked = 0;
    let notVisited = 0;

    Object.values(answersMap).forEach((ans) => {
      if (ans.status === 'answered') answered++;
      else if (ans.status === 'not_answered') notAnswered++;
      else if (ans.status === 'marked_for_review') marked++;
      else notVisited++;
    });

    return { answered, notAnswered, marked, notVisited };
  }, [answersMap]);

  if (loading || !testMeta || !currentQuestion) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8FAFC] dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Generating Secure Exam Paper...</h2>
        <p className="text-sm text-slate-500 mt-1">Fetching published questions and setting timer bounds</p>
      </div>
    );
  }

  const renderPaletteGrid = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0"></span>
          <span>{paletteCounts.answered} Answered</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200">
          <span className="w-3.5 h-3.5 rounded-full bg-rose-600 dark:bg-rose-400 shrink-0"></span>
          <span>{paletteCounts.notAnswered} Not Answered</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200">
          <span className="w-3.5 h-3.5 rounded-full bg-purple-600 dark:bg-purple-400 shrink-0"></span>
          <span>{paletteCounts.marked} Review</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200">
          <span className="w-3.5 h-3.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0"></span>
          <span>{paletteCounts.notVisited} Not Visited</span>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wide">Questions Grid</h4>
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto pr-1">
          {sectionQuestions.map((q, idx) => {
            const qAns = answersMap[q.id];
            const isCurrent = idx === currentQuestionIndex;

            let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
            if (qAns?.status === 'answered') {
              badgeStyle = 'bg-emerald-600 dark:bg-emerald-500 text-white font-bold border-emerald-700';
            } else if (qAns?.status === 'not_answered') {
              badgeStyle = 'bg-rose-600 dark:bg-rose-500 text-white font-bold border-rose-700';
            } else if (qAns?.status === 'marked_for_review') {
              badgeStyle = 'bg-purple-600 dark:bg-purple-500 text-white font-bold border-purple-700';
            }

            return (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentQuestionIndex(idx);
                  setShowMobilePalette(false);
                }}
                className={`h-10 rounded-xl text-xs font-black border flex items-center justify-center transition-all ${badgeStyle} ${
                  isCurrent ? 'ring-2 ring-[#0F4C81] dark:ring-[#38BDF8] ring-offset-2 scale-105 shadow-md' : ''
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {notification && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-bounce max-w-[90vw]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">{notification}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="h-14 sm:h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D2A] px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8] font-bold text-[10px] sm:text-xs tracking-wide shrink-0">
            {testMeta.exam}
          </span>
          <h1 className="font-bold text-xs sm:text-base truncate max-w-[160px] sm:max-w-md text-slate-900 dark:text-slate-100">
            {testMeta.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-mono font-bold text-xs sm:text-sm">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse text-amber-600" />
            <span>{formattedTime}</span>
          </div>

          <button
            onClick={() => setShowMobilePalette(!showMobilePalette)}
            className="md:hidden p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            aria-label="Toggle Question Palette"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={isSubmitting}
            className="hidden sm:flex px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Submit Test
          </button>
        </div>
      </header>

      {/* Section Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#151D2A]/60 px-3 sm:px-6 flex items-center gap-1.5 sm:gap-2 overflow-x-auto shrink-0">
        <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1 shrink-0">Sections:</span>
        {sectionsList.map((secName) => (
          <button
            key={secName}
            onClick={() => {
              setActiveSectionName(secName);
              setCurrentQuestionIndex(0);
            }}
            className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeSectionName === secName
                ? 'border-[#0F4C81] text-[#0F4C81] dark:text-[#38BDF8] bg-[#0F4C81]/10 dark:bg-[#38BDF8]/10'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {secName}
          </button>
        ))}
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Main Question Display Area */}
        <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-y-auto bg-white dark:bg-[#0B0F17]">

          {/* Question Header Status Bar */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2.5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm sm:text-base font-black text-[#0F4C81] dark:text-[#38BDF8] shrink-0">
                Q{currentQuestionIndex + 1}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
                of {sectionQuestions.length} ({activeSectionName})
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                +1.0 / -0.25
              </span>
              <button
                onClick={() => toggleBookmark(currentQuestion.id)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  bookmarks.includes(currentQuestion.id)
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-600'
                    : 'border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Bookmark Question"
              >
                <Bookmark className={`w-4 h-4 ${bookmarks.includes(currentQuestion.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Question Body */}
          <div className="space-y-4 sm:space-y-6 flex-1 pb-24 md:pb-6">
            <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed pr-1">
              {currentQuestion.questionText}
            </div>

            {/* Answer Options */}
            <div className="space-y-2.5 sm:space-y-3 max-w-2xl">
              {currentQuestion.options.map((opt) => {
                const isSelected = answersMap[currentQuestion.id]?.selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full p-3.5 sm:p-4 rounded-xl border-2 text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-[#0F4C81] dark:border-[#38BDF8] bg-[#0F4C81]/10 dark:bg-[#38BDF8]/15 text-[#0F4C81] dark:text-[#38BDF8] font-bold shadow-sm'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#151D2A] hover:border-slate-400 dark:hover:border-slate-600 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#0F4C81] dark:bg-[#38BDF8] text-white dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                    }`}>
                      {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : opt.option_key}
                    </span>
                    <span className="flex-1 leading-snug">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Footer Actions */}
          <div className="hidden md:flex pt-4 mt-auto border-t border-slate-200 dark:border-slate-800 items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkForReview}
                className="px-3.5 py-2 rounded-xl border border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-100 transition-colors"
              >
                Mark For Review
              </button>
              <button
                onClick={handleClearResponse}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-semibold text-xs transition-colors"
              >
                Clear Response
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={handleSaveAndNext}
                className="px-5 py-2 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-black text-xs shadow-md transition-all flex items-center gap-1"
              >
                Save & Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar Question Palette */}
        <div className="hidden md:flex w-80 bg-slate-50 dark:bg-[#151D2A] p-5 flex-col justify-between overflow-y-auto border-l border-slate-200 dark:border-slate-800">
          <div className="space-y-4">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Question Palette</h3>
            {renderPaletteGrid()}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Final Submit
            </button>
          </div>
        </div>

        {/* Mobile Slide-Up Question Palette Drawer */}
        {showMobilePalette && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end">
            <div className="bg-white dark:bg-[#151D2A] border-t border-slate-200 dark:border-slate-800 rounded-t-2xl p-4 space-y-4 max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">Question Palette Overview</h3>
                <button
                  onClick={() => setShowMobilePalette(false)}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {renderPaletteGrid()}

              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowMobilePalette(false);
                    setShowSubmitModal(true);
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
                >
                  Submit Entire Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Sticky Navigation Controls */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#151D2A] border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleMarkForReview}
            className="p-2.5 rounded-xl border border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold text-[11px]"
            title="Mark for Review"
          >
            Review
          </button>
          <button
            onClick={handleClearResponse}
            className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-[11px]"
          >
            Clear
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs disabled:opacity-40 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <button
            onClick={handleSaveAndNext}
            className="px-4 py-2.5 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-black text-xs shadow-md flex items-center gap-1"
          >
            Save & Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <ShieldCheck className="w-6 h-6 text-[#0F4C81] dark:text-[#38BDF8]" />
              <h3 className="text-lg font-black">Submit Test Confirmation</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to submit your test? Once submitted, your answers will be locked and scored immediately.
            </p>

            <div className="grid grid-cols-2 gap-2.5 py-1">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-center">
                <span className="block text-xl font-black text-emerald-800 dark:text-emerald-300">{paletteCounts.answered}</span>
                <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200">Answered</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-center">
                <span className="block text-xl font-black text-rose-800 dark:text-rose-300">{paletteCounts.notAnswered + paletteCounts.notVisited}</span>
                <span className="text-[11px] font-bold text-rose-900 dark:text-rose-200">Unanswered</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950/50 border border-purple-300 dark:border-purple-800 text-center">
                <span className="block text-xl font-black text-purple-800 dark:text-purple-300">{paletteCounts.marked}</span>
                <span className="text-[11px] font-bold text-purple-900 dark:text-purple-200">Marked Review</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center">
                <span className="block text-xl font-black text-slate-800 dark:text-slate-200">{questions.length}</span>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Total Questions</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-100"
              >
                Return to Test
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleFinalSubmission(false);
                }}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
