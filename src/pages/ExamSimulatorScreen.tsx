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
  Check
} from 'lucide-react';

export const ExamSimulatorScreen: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { bookmarks, toggleBookmark, user } = useApp();

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

  const activeUserId = user?.id || 'usr-student-1';

  useEffect(() => {
    const currentTestId = testId || 'test-sbi-clerk-full-01';
    let isMounted = true;

    async function initExam() {
      try {
        setLoading(true);
        const attemptData = await attemptService.startAttempt(currentTestId, activeUserId);
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
  }, [testId, activeUserId]);

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
          activeUserId,
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
    [isSubmitting, testMeta, attemptId, testId, startedAtMs, answersMap, navigate, activeUserId]
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
        attemptService.updateAnswer(activeTestId, activeUserId, attemptId, updated);
      }
    }
  }, [currentQuestion, testId, testMeta, attemptId, answersMap, activeUserId]);

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
      attemptService.updateAnswer(activeTestId, activeUserId, attemptId, updated);
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
      attemptService.updateAnswer(activeTestId, activeUserId, attemptId, updated);
    }

    if (currentQuestionIndex < sectionQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Transition to next section if available
      const currentSecIdx = sectionsList.indexOf(activeSectionName);
      if (currentSecIdx < sectionsList.length - 1) {
        const nextSec = sectionsList[currentSecIdx + 1];
        setActiveSectionName(nextSec);
        setCurrentQuestionIndex(0);
        setNotification(`Moved to next section: ${nextSec}`);
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification('You have reached the end of the test. Click Submit Test to finish.');
        setTimeout(() => setNotification(null), 3000);
      }
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
      attemptService.updateAnswer(activeTestId, activeUserId, attemptId, updated);
    }

    if (currentQuestionIndex < sectionQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Transition to next section if available
      const currentSecIdx = sectionsList.indexOf(activeSectionName);
      if (currentSecIdx < sectionsList.length - 1) {
        const nextSec = sectionsList[currentSecIdx + 1];
        setActiveSectionName(nextSec);
        setCurrentQuestionIndex(0);
        setNotification(`Moved to next section: ${nextSec}`);
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification('You have reached the end of the test. Click Submit Test to finish.');
        setTimeout(() => setNotification(null), 3000);
      }
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
      attemptService.updateAnswer(activeTestId, activeUserId, attemptId, updated);
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
      <div className="grid grid-cols-2 gap-2 text-xs font-bold">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-400 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0"></span>
          <span>{paletteCounts.answered} Answered</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-400 dark:border-rose-800 text-rose-950 dark:text-rose-200">
          <span className="w-3.5 h-3.5 rounded-full bg-rose-600 dark:bg-rose-400 shrink-0"></span>
          <span>{paletteCounts.notAnswered} Not Answered</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-400 dark:border-purple-800 text-purple-950 dark:text-purple-200">
          <span className="w-3.5 h-3.5 rounded-full bg-purple-600 dark:bg-purple-400 shrink-0"></span>
          <span>{paletteCounts.marked} Review</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200">
          <span className="w-3.5 h-3.5 rounded-full bg-slate-500 dark:bg-slate-400 shrink-0"></span>
          <span>{paletteCounts.notVisited} Not Visited</span>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 mb-2.5 uppercase tracking-wide">Questions Grid</h4>
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto pr-1">
          {sectionQuestions.map((q, idx) => {
            const qAns = answersMap[q.id];
            const isCurrent = idx === currentQuestionIndex;

            let badgeStyle = 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700';
            if (qAns?.status === 'answered') {
              badgeStyle = 'bg-emerald-600 dark:bg-emerald-500 text-white font-black border-emerald-700';
            } else if (qAns?.status === 'not_answered') {
              badgeStyle = 'bg-rose-600 dark:bg-rose-500 text-white font-black border-rose-700';
            } else if (qAns?.status === 'marked_for_review') {
              badgeStyle = 'bg-purple-600 dark:bg-purple-500 text-white font-black border-purple-700';
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
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-[#0F4C81] dark:bg-[#38BDF8] text-white dark:text-slate-950 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce max-w-[90vw] border border-white/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">{notification}</span>
        </div>
      )}

      {/* Top Header - High Contrast Dark Banking Header Bar across Light & Dark Mode */}
      <header className="h-14 sm:h-16 border-b border-[#0B3A64] dark:border-slate-800 bg-[#0F4C81] dark:bg-[#151D2A] px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="px-2.5 py-1 rounded-lg bg-white/20 dark:bg-[#38BDF8]/25 text-white dark:text-[#38BDF8] font-black text-xs sm:text-sm tracking-wide shrink-0 border border-white/40 dark:border-[#38BDF8]/40 shadow-xs">
            {testMeta.exam}
          </span>
          <h1 className="font-black text-sm sm:text-lg truncate max-w-[200px] sm:max-w-xl text-white tracking-tight leading-snug drop-shadow-xs">
            {testMeta.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-mono font-black text-xs sm:text-sm shadow-xs border border-amber-300">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse text-slate-950" />
            <span>{formattedTime}</span>
          </div>

          <button
            onClick={() => setShowMobilePalette(!showMobilePalette)}
            className="md:hidden p-2 rounded-xl border border-white/30 bg-white/10 text-white hover:bg-white/20"
            aria-label="Toggle Question Palette"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={isSubmitting}
            className="hidden sm:flex px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-md transition-colors items-center gap-1.5 border border-emerald-400"
          >
            <Send className="w-3.5 h-3.5" /> Submit Test
          </button>
        </div>
      </header>

      {/* Section Tabs Row - Clean High-Contrast Layout */}
      <div className="border-b border-slate-300 dark:border-slate-800 bg-slate-200 dark:bg-[#151D2A]/90 px-3 sm:px-6 flex items-center gap-2 overflow-x-auto shrink-0 py-1.5">
        <span className="text-[10px] sm:text-xs font-black text-slate-800 dark:text-slate-300 uppercase tracking-wider mr-1 shrink-0">Sections:</span>
        {sectionsList.map((secName) => (
          <button
            key={secName}
            onClick={() => {
              setActiveSectionName(secName);
              setCurrentQuestionIndex(0);
            }}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all whitespace-nowrap ${
              activeSectionName === secName
                ? 'bg-[#0F4C81] dark:bg-[#38BDF8] text-white dark:text-slate-950 shadow-md ring-1 ring-[#0F4C81]'
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
            }`}
          >
            {secName}
          </button>
        ))}
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Main Question Display Area */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B0F17]">

          <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col">
            {/* Question Header Status Bar */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 border-b-2 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg sm:text-2xl font-black text-[#0F4C81] dark:text-[#38BDF8] shrink-0">
                  Q{currentQuestionIndex + 1}
                </span>
                <span className="text-xs sm:text-base text-slate-900 dark:text-slate-100 font-extrabold truncate">
                  of {sectionQuestions.length} ({activeSectionName})
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-black px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700">
                  +1.0 / -0.25
                </span>
                <button
                  onClick={() => toggleBookmark(currentQuestion.id)}
                  className={`p-2 rounded-xl border transition-colors ${
                    bookmarks.includes(currentQuestion.id)
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-600'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                  title="Bookmark Question"
                >
                  <Bookmark className={`w-4 h-4 ${bookmarks.includes(currentQuestion.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Question Body */}
            <div className="space-y-6 flex-1 pb-24 md:pb-6">
              <div className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 leading-relaxed pr-1">
                {currentQuestion.questionText}
              </div>

              {/* Answer Options */}
              <div className="space-y-3.5 max-w-3xl pt-2">
                {currentQuestion.options.map((opt) => {
                  const isSelected = answersMap[currentQuestion.id]?.selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left text-sm sm:text-base font-medium transition-all flex items-start sm:items-center gap-3.5 sm:gap-4 shadow-xs ${
                        isSelected
                          ? 'border-[#0F4C81] dark:border-[#38BDF8] bg-sky-50 dark:bg-[#38BDF8]/20 text-[#0F4C81] dark:text-[#38BDF8] font-bold ring-2 ring-[#0F4C81]/40 dark:ring-[#38BDF8]/40 shadow-sm'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#151D2A] hover:border-[#0F4C81] dark:hover:border-[#38BDF8] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      <span className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 mt-0.5 sm:mt-0 transition-colors ${
                        isSelected
                          ? 'bg-[#0F4C81] dark:bg-[#38BDF8] text-white dark:text-slate-950 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-2 border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected ? <Check className="w-5 h-5 stroke-[3]" /> : opt.option_key}
                      </span>
                      <span className="flex-1 leading-relaxed text-slate-900 dark:text-slate-100 text-sm sm:text-base font-semibold">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Footer Actions */}
            <div className="hidden md:flex pt-4 mt-auto border-t-2 border-slate-200 dark:border-slate-800 items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkForReview}
                  className="px-4 py-2.5 rounded-xl border-2 border-purple-400 dark:border-purple-600 bg-purple-100 dark:bg-purple-950/50 text-purple-950 dark:text-purple-200 font-extrabold text-xs hover:bg-purple-200 transition-colors"
                >
                  Mark For Review
                </button>
                <button
                  onClick={handleClearResponse}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs transition-colors"
                >
                  Clear Response
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentQuestionIndex === 0 && sectionsList.indexOf(activeSectionName) === 0}
                  onClick={() => {
                    if (currentQuestionIndex > 0) {
                      setCurrentQuestionIndex((prev) => prev - 1);
                    } else {
                      const currentSecIdx = sectionsList.indexOf(activeSectionName);
                      if (currentSecIdx > 0) {
                        const prevSec = sectionsList[currentSecIdx - 1];
                        const prevSecQuestions = questions.filter((q) => q.sectionName === prevSec);
                        setActiveSectionName(prevSec);
                        setCurrentQuestionIndex(Math.max(0, prevSecQuestions.length - 1));
                      }
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-extrabold text-xs disabled:opacity-40 flex items-center gap-1 hover:bg-slate-50"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={handleSaveAndNext}
                  className="px-5 py-2.5 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] dark:bg-[#38BDF8] dark:hover:bg-[#0284C7] text-white dark:text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1"
                >
                  Save & Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar Question Palette */}
        <div className="hidden md:flex w-80 bg-slate-100 dark:bg-[#151D2A] p-5 flex-col justify-between overflow-y-auto border-l-2 border-slate-300 dark:border-slate-800">
          <div className="space-y-4">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">Question Palette</h3>
            {renderPaletteGrid()}
          </div>

          <div className="pt-4 border-t-2 border-slate-300 dark:border-slate-800">
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
            <div className="bg-white dark:bg-[#151D2A] border-t-2 border-slate-300 dark:border-slate-800 rounded-t-2xl p-4 space-y-4 max-h-[80vh] overflow-y-auto shadow-2xl">
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-100 dark:bg-[#151D2A] border-t-2 border-slate-300 dark:border-slate-800 px-3 py-2 flex items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleMarkForReview}
            className="p-2.5 rounded-xl border border-purple-400 dark:border-purple-600 bg-purple-100 dark:bg-purple-950/40 text-purple-950 dark:text-purple-300 font-black text-[11px]"
            title="Mark for Review"
          >
            Review
          </button>
          <button
            onClick={handleClearResponse}
            className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-[11px]"
          >
            Clear
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={currentQuestionIndex === 0 && sectionsList.indexOf(activeSectionName) === 0}
            onClick={() => {
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex((prev) => prev - 1);
              } else {
                const currentSecIdx = sectionsList.indexOf(activeSectionName);
                if (currentSecIdx > 0) {
                  const prevSec = sectionsList[currentSecIdx - 1];
                  const prevSecQuestions = questions.filter((q) => q.sectionName === prevSec);
                  setActiveSectionName(prevSec);
                  setCurrentQuestionIndex(Math.max(0, prevSecQuestions.length - 1));
                }
              }
            }}
            className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs disabled:opacity-40 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <button
            onClick={handleSaveAndNext}
            className="px-4 py-2.5 rounded-xl bg-[#0F4C81] dark:bg-[#38BDF8] text-white dark:text-slate-950 font-black text-xs shadow-md flex items-center gap-1"
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
                className="flex-1 py-2.5 rounded-xl border border-[#0F4C81] dark:border-[#38BDF8] text-[#0F4C81] dark:text-[#38BDF8] font-bold text-xs hover:bg-[#0F4C81]/10"
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
