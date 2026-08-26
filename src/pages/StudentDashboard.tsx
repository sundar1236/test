import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { progressService } from '../services/progressService';
import { examService } from '../services/examService';
import {
  Trophy,
  AlertTriangle,
  Play,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { testAttempts, userProfile, bookmarks } = useApp();

  const [dbExams, setDbExams] = useState<any[]>([]);
  useEffect(() => {
    examService.getExams().then((data) => {
      if (data) setDbExams(data);
    }).catch(() => {});
  }, []);

  const currentTargetExamObj = useMemo(() => {
    if (userProfile.targetExamId && dbExams.length > 0) {
      return dbExams.find((e) => e.id === userProfile.targetExamId) || null;
    }
    if (dbExams.length > 0) {
      return dbExams.find((e) => e.title === userProfile.targetExam) || null;
    }
    return null;
  }, [userProfile.targetExamId, userProfile.targetExam, dbExams]);

  const isExamUnavailable = currentTargetExamObj && currentTargetExamObj.is_active === false;
  const displayExamTitle = currentTargetExamObj ? currentTargetExamObj.title : userProfile.targetExam || 'SBI Clerk';

  // Aggregate KPI Metrics
  const stats = useMemo(() => {
    return progressService.calculateDashboardStats(testAttempts);
  }, [testAttempts]);

  // Weak Areas & Recommendations
  const weakTopics = useMemo(() => {
    return progressService.identifyWeakTopics(testAttempts);
  }, [testAttempts]);

  const recommendations = useMemo(() => {
    return progressService.generatePracticeRecommendations(testAttempts);
  }, [testAttempts]);

  // Exam-specific summaries
  const examSummaries = useMemo(() => {
    return progressService.calculateExamProgressSummaries(testAttempts);
  }, [testAttempts]);

  const recentAttempts = testAttempts.slice(0, 3);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* Top Banner */}
      <div className="p-5 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0F4C81] to-[#2563EB] text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="space-y-2">
          {isExamUnavailable ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-500/30 text-rose-100 text-xs font-extrabold border border-rose-300/40">
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
              <span>Your selected exam is currently unavailable. Please choose another exam in Profile Settings.</span>
              <button onClick={() => navigate('/profile')} className="ml-2 underline hover:text-white">Choose Exam</button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/15 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Target Exam: {displayExamTitle}</span>
            </div>
          )}
          <h1 className="text-xl sm:text-3xl font-black">Welcome Back, {userProfile.name}!</h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl font-medium leading-relaxed">
            You are currently ranked <strong className="text-white">#{userProfile.globalRank}</strong> among aspirants. Continue practicing to boost your accuracy and percentile.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => navigate('/mock-tests')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-[#0F4C81] font-black text-xs hover:bg-blue-50 shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" /> Start Mock Test
          </button>
        </div>
      </div>

      {/* Zero Attempt Empty State Banner */}
      {testAttempts.length === 0 && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#0F4C81]/15 text-[#0F4C81] dark:text-[#38BDF8] flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-main)]">You haven't completed a mock test yet</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Take your first full SBI or IBPS Clerk mock exam to unlock detailed scorecards, accuracy graphs, and weak topic diagnostic reports.
            </p>
          </div>
          <button
            onClick={() => navigate('/mock-tests')}
            className="px-6 py-2.5 rounded-xl bg-[#0F4C81] text-white font-bold text-xs shadow-md"
          >
            Take First Free Test
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Tests Attempted</span>
          <div className="text-2xl sm:text-3xl font-black text-[#0F4C81] dark:text-[#38BDF8]">
            {stats.totalTestsAttempted}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-semibold">{stats.completedTests} completed</span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Average Score</span>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-main)] font-mono">
            {stats.avgScore} <span className="text-xs font-normal text-[var(--text-muted)]">/ 100</span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">Best: {stats.bestScore}</span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Average Accuracy</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            {stats.avgAccuracy}%
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-semibold">{stats.correctAnswers} correct choices</span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Bookmarked Qs</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {bookmarks.length}
          </div>
          <button
            onClick={() => navigate('/bookmarks')}
            className="text-[11px] text-[#0F4C81] dark:text-[#38BDF8] font-bold hover:underline"
          >
            View Bookmarks →
          </button>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Recent Activity & Exam Breakdown */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Attempts */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[var(--text-main)]">Recent Test Activity</h2>
              <button
                onClick={() => navigate('/attempts')}
                className="text-xs font-bold text-[#0F4C81] dark:text-[#38BDF8] hover:underline"
              >
                View Full History →
              </button>
            </div>

            {recentAttempts.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic py-2">No recent test attempts found.</p>
            ) : (
              <div className="space-y-3">
                {recentAttempts.map((item) => (
                  <div
                    key={item.attemptId}
                    className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#0F4C81]/15 text-[#0F4C81] dark:text-[#38BDF8]">
                        {item.exam}
                      </span>
                      <h3 className="font-bold text-xs sm:text-sm text-[var(--text-main)]">{item.testTitle}</h3>
                      <p className="text-[11px] text-[var(--text-muted)] font-medium">Attempted on {item.dateCompleted}</p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--border-color)]">
                      <div>
                        <span className="block text-sm font-black text-[var(--text-main)] font-mono">{item.score.toFixed(1)}</span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">{item.accuracy.toFixed(1)}% Acc</span>
                      </div>
                      <button
                        onClick={() => navigate(`/results/${item.attemptId}`, { state: { result: item } })}
                        className="px-3 py-1.5 rounded-lg bg-[#0F4C81] text-white font-bold text-xs shadow-xs"
                      >
                        Scorecard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exam-specific Progress Breakdown */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-[var(--text-main)]">Exam-Wise Performance Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {examSummaries.map((ex) => (
                <div key={ex.exam} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs text-[#0F4C81] dark:text-[#38BDF8]">{ex.exam}</span>
                    <span className="text-[10px] font-bold text-[var(--text-muted)]">{ex.testsTaken} Tests Taken</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block uppercase">Avg Score</span>
                      <span className="font-mono text-sm font-black text-[var(--text-main)]">{ex.avgScore}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block uppercase">Avg Accuracy</span>
                      <span className="font-mono text-sm font-black text-emerald-700 dark:text-emerald-400">{ex.avgAccuracy}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Weak Areas & Recommended Practice */}
        <div className="space-y-6">

          {/* Weak Topics Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2 className="text-base font-extrabold text-[var(--text-main)]">Weak Topics Identified</h2>
            </div>

            {weakTopics.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold">
                ✓ No weak topics detected! Your overall accuracy across attempted questions is above 70%.
              </div>
            ) : (
              <div className="space-y-3">
                {weakTopics.map((wt) => (
                  <div key={wt.topicName} className="p-3.5 rounded-xl bg-rose-100/80 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-slate-100">
                      <span>{wt.topicName}</span>
                      <span className="text-rose-700 dark:text-rose-400 font-mono font-black">{wt.accuracy}%</span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300">
                      {wt.sectionName} • {wt.questionsAttempted} Qs attempted
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Practice */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-[var(--text-main)]">Recommended Practice</h2>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-4 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30 space-y-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-sky-700 text-white uppercase">
                    Target Practice
                  </span>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">{rec.topicName}</h3>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">{rec.reason}</p>
                  <button
                    onClick={() => navigate('/questions')}
                    className="w-full py-2 rounded-lg bg-[#0F4C81] text-white font-bold text-xs shadow-xs"
                  >
                    {rec.actionText}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
