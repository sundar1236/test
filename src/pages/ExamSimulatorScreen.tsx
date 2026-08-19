import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { initialMockTests, initialQuestions } from '../data/mockData';
import { UserAnswerState, SubjectSection, TestAttemptResult } from '../types';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Send,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';

export const ExamSimulatorScreen: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { saveTestAttempt, bookmarks, toggleBookmark } = useApp();

  // Load Test Metadata
  const testMeta = useMemo(() => {
    return initialMockTests.find((t) => t.id === testId) || initialMockTests[0];
  }, [testId]);

  // Load Test Questions
  const testQuestions = useMemo(() => {
    return initialQuestions.filter((q) => q.status === 'approved');
  }, []);

  // Section Management
  const sections: SubjectSection[] = testMeta.sections;
  const [activeSection, setActiveSection] = useState<SubjectSection>(sections[0]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // Timer State (in seconds)
  const [timeLeft, setTimeLeft] = useState<number>(testMeta.durationMinutes * 60);

  // Answers State: Map questionId -> UserAnswerState
  const [answersMap, setAnswersMap] = useState<Record<string, UserAnswerState>>(() => {
    const initialMap: Record<string, UserAnswerState> = {};
    testQuestions.forEach((q) => {
      initialMap[q.id] = {
        questionId: q.id,
        selectedOptionId: null,
        status: 'not_visited',
        timeSpentSeconds: 0,
      };
    });
    // Mark first question as not answered (visited)
    if (testQuestions.length > 0) {
      initialMap[testQuestions[0].id].status = 'not_answered';
    }
    return initialMap;
  });

  // Filter current section questions
  const activeSectionQuestions = useMemo(() => {
    return testQuestions.filter((q) => q.section === activeSection);
  }, [testQuestions, activeSection]);

  const currentQuestion = activeSectionQuestions[currentQuestionIndex] || testQuestions[0];

  // Timer Countdown Effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinalSubmission();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
      // Increment time spent on active question
      if (currentQuestion) {
        setAnswersMap((prev) => ({
          ...prev,
          [currentQuestion.id]: {
            ...prev[currentQuestion.id],
            timeSpentSeconds: (prev[currentQuestion.id]?.timeSpentSeconds || 0) + 1,
          },
        }));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, currentQuestion]);

  // Update Status to 'not_answered' if 'not_visited' when viewing a question
  useEffect(() => {
    if (currentQuestion && answersMap[currentQuestion.id]?.status === 'not_visited') {
      setAnswersMap((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          status: 'not_answered',
        },
      }));
    }
  }, [currentQuestion]);

  // Handle Option Selection
  const handleSelectOption = (optionId: string) => {
    setAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOptionId: optionId,
      },
    }));
  };

  // Handle Save & Next
  const handleSaveAndNext = () => {
    const currentAns = answersMap[currentQuestion.id];
    const newStatus = currentAns.selectedOptionId ? 'answered' : 'not_answered';

    setAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], status: newStatus },
    }));

    if (currentQuestionIndex < activeSectionQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Handle Mark For Review
  const handleMarkForReview = () => {
    setAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], status: 'marked_for_review' },
    }));

    if (currentQuestionIndex < activeSectionQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Handle Clear Response
  const handleClearResponse = () => {
    setAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOptionId: null,
        status: 'not_answered',
      },
    }));
  };

  // Handle Final Submission & Generate Comprehensive Report
  const handleFinalSubmission = () => {
    let totalAttempted = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let totalScore = 0;

    const sectionBreakdown: Record<string, { score: number; total: number; correct: number; wrong: number }> = {};
    const topicBreakdown: Record<string, { total: number; correct: number; accuracy: number }> = {};

    testQuestions.forEach((q) => {
      const uAns = answersMap[q.id];
      const isAttempted = uAns?.selectedOptionId !== null && uAns?.selectedOptionId !== undefined;

      // Section breakdown init
      if (!sectionBreakdown[q.section]) {
        sectionBreakdown[q.section] = { score: 0, total: 0, correct: 0, wrong: 0 };
      }
      sectionBreakdown[q.section].total += 1;

      // Topic breakdown init
      if (!topicBreakdown[q.topic]) {
        topicBreakdown[q.topic] = { total: 0, correct: 0, accuracy: 0 };
      }
      topicBreakdown[q.topic].total += 1;

      if (isAttempted) {
        totalAttempted += 1;
        if (uAns.selectedOptionId === q.correctOptionId) {
          correctCount += 1;
          totalScore += 1; // +1 for correct
          sectionBreakdown[q.section].correct += 1;
          sectionBreakdown[q.section].score += 1;
          topicBreakdown[q.topic].correct += 1;
        } else {
          wrongCount += 1;
          totalScore -= 0.25; // -0.25 negative marking
          sectionBreakdown[q.section].wrong += 1;
          sectionBreakdown[q.section].score -= 0.25;
        }
      }
    });

    // Calculate topic accuracies
    Object.keys(topicBreakdown).forEach((tKey) => {
      const item = topicBreakdown[tKey];
      item.accuracy = item.total > 0 ? (item.correct / item.total) * 100 : 0;
    });

    const totalQuestions = testQuestions.length;
    const skippedQuestions = totalQuestions - totalAttempted;
    const accuracy = totalAttempted > 0 ? (correctCount / totalAttempted) * 100 : 0;
    const percentile = Math.min(99.8, Math.max(50, 70 + (totalScore / totalQuestions) * 30));

    const resultObject: TestAttemptResult = {
      attemptId: `att-${Date.now()}`,
      testId: testMeta.id,
      testTitle: testMeta.title,
      exam: testMeta.exam,
      dateCompleted: new Date().toLocaleDateString(),
      timeSpentSeconds: testMeta.durationMinutes * 60 - timeLeft,
      totalQuestions,
      attemptedQuestions: totalAttempted,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      skippedQuestions,
      score: Math.max(0, totalScore),
      maxScore: totalQuestions,
      accuracy: Math.round(accuracy * 100) / 100,
      percentile: Math.round(percentile * 10) / 10,
      sectionBreakdown,
      topicBreakdown,
      userAnswers: answersMap,
    };

    saveTestAttempt(resultObject);
    navigate(`/results/${resultObject.attemptId}`);
  };

  // Format Timer String
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Question Palette Counts
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

  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans overflow-hidden">

      {/* Exam Top Bar */}
      <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-card)] px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-lg bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8] font-bold text-xs uppercase tracking-wider">
            {testMeta.exam}
          </div>
          <h1 className="font-bold text-sm sm:text-base text-[var(--text-main)] truncate max-w-md">
            {testMeta.title}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Real Live Timer */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-mono font-bold text-sm">
            <Clock className="w-4 h-4 animate-pulse text-amber-600" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={handleFinalSubmission}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Submit Exam
          </button>
        </div>
      </header>

      {/* Section Tabs Bar */}
      <div className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/50 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mr-2">Sections:</span>
        {sections.map((sec) => (
          <button
            key={sec}
            onClick={() => {
              setActiveSection(sec);
              setCurrentQuestionIndex(0);
            }}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeSection === sec
                ? 'border-[#0F4C81] text-[#0F4C81] dark:text-[#38BDF8] bg-[#0F4C81]/5'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Main Examination Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* Left Side: Question & Options */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto border-r border-[var(--border-color)]">

          {/* Question Meta Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-[#0F4C81] dark:text-[#38BDF8]">
                Question {currentQuestionIndex + 1}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-medium">
                of {activeSectionQuestions.length} in {activeSection}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]">
                +1.0 Marks • -0.25 Negative
              </span>
              <button
                onClick={() => toggleBookmark(currentQuestion.id)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  bookmarks.includes(currentQuestion.id)
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                    : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarks.includes(currentQuestion.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Question Body */}
          <div className="space-y-6 flex-1">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)] leading-relaxed">
              {currentQuestion.questionText}
            </h2>

            {/* Options List */}
            <div className="space-y-3 max-w-2xl">
              {currentQuestion.options.map((opt) => {
                const isSelected = answersMap[currentQuestion.id]?.selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full p-4 rounded-xl border text-left text-sm font-semibold transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? 'border-[#0F4C81] bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8] shadow-xs'
                        : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-main)] text-[var(--text-main)]'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? 'bg-[#0F4C81] text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-[var(--text-main)]'
                    }`}>
                      {opt.id}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigation Buttons Bar */}
          <div className="pt-6 mt-6 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkForReview}
                className="px-4 py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs hover:bg-purple-500/20 transition-colors"
              >
                Mark For Review
              </button>
              <button
                onClick={handleClearResponse}
                className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-semibold text-xs hover:bg-[var(--bg-main)] transition-colors"
              >
                Clear Response
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-main)] font-bold text-xs disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={handleSaveAndNext}
                className="px-6 py-2.5 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1"
              >
                Save & Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Question Palette & Legend */}
        <div className="w-full md:w-80 bg-[var(--bg-card)] p-4 sm:p-5 flex flex-col justify-between overflow-y-auto border-t md:border-t-0 md:border-l border-[var(--border-color)]">

          <div className="space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-[var(--text-muted)]">Question Palette</h3>

            {/* Legend Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>{paletteCounts.answered} Answered</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span>{paletteCounts.notAnswered} Not Answered</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-400">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span>{paletteCounts.marked} Review</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]">
                <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                <span>{paletteCounts.notVisited} Not Visited</span>
              </div>
            </div>

            {/* Question Numbers Grid */}
            <div className="pt-2">
              <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1">
                {activeSectionQuestions.map((q, idx) => {
                  const qAns = answersMap[q.id];
                  const isCurrent = idx === currentQuestionIndex;

                  let badgeColor = 'bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] border-slate-200';
                  if (qAns?.status === 'answered') {
                    badgeColor = 'bg-emerald-500 text-white border-emerald-600 font-bold';
                  } else if (qAns?.status === 'not_answered') {
                    badgeColor = 'bg-rose-500 text-white border-rose-600 font-bold';
                  } else if (qAns?.status === 'marked_for_review') {
                    badgeColor = 'bg-purple-600 text-white border-purple-700 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 rounded-lg border text-xs flex items-center justify-center transition-all ${badgeColor} ${
                        isCurrent ? 'ring-2 ring-[#0F4C81] ring-offset-2' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-color)]">
            <button
              onClick={handleFinalSubmission}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Submit Exam Now
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
