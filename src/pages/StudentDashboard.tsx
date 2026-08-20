import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { progressService } from '../services/progressService';
import {
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  ArrowRight,
  TrendingUp,
  Bookmark,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { testAttempts, userProfile, bookmarks } = useApp();

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
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0F4C81] to-[#2563EB] text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/15 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Target Exam: {userProfile.targetExam || 'SBI Clerk'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome Back, {userProfile.name}!</h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl font-medium">
            You are currently ranked <strong className="text-white">#{userProfile.globalRank}</strong> among aspirants. Continue practicing to boost your accuracy and percentile.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/mock-tests')}
            className="px-6 py-3 rounded-xl bg-white text-[#0F4C81] font-extrabold text-xs hover:bg-blue-50 shadow-md transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" /> Start Mock Test
          </button>
        </div>
      </div>

      {/* Zero Attempt Empty State Banner */}
      {testAttempts.length === 0 && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-[var(--border-color)] shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#0F4C81]/10 text-[#0F4C81] flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-extrabold text-[var(--text-main)]">You haven't completed a mock test yet</h3>
            <p className="text-xs text-[var(--text-muted)]">
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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Tests Attempted</span>
          <div className="text-2xl sm:text-3xl font-black text-[#0F4C81] dark:text-[#38BDF8]">
            {stats.totalTestsAttempted}
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">{stats.completedTests} completed</span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Average Score</span>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-main)] font-mono">
            {stats.avgScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">Best: {stats.bestScore}</span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Average Accuracy</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
            {stats.avgAccuracy}%
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">{stats.correctAnswers} correct choices</span>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Bookmarked Qs</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-500">
            {bookmarks.length}
          </div>
          <button
            onClick={() => navigate('/bookmarks')}
            className="text-[10px] text-[#0F4C81] font-bold hover:underline"
          >
            View Bookmarks →
          </button>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Recent Activity & Exam Breakdown */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Attempts */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[var(--text-main)]">Recent Test Activity</h2>
              <button
                onClick={() => navigate('/attempts')}
                className="text-xs font-bold text-[#0F4C81] hover:underline"
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
                    className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] hover:border-[#0F4C81]/30 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0F4C81]/10 text-[#0F4C81]">
                        {item.exam}
                      </span>
                      <h3 className="font-bold text-xs text-[var(--text-main)]">{item.testTitle}</h3>
                      <p className="text-[11px] text-[var(--text-muted)] font-medium">Attempted on {item.dateCompleted}</p>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="block text-sm font-black text-[var(--text-main)] font-mono">{item.score.toFixed(1)}</span>
                        <span className="text-[10px] font-bold text-emerald-600">{item.accuracy.toFixed(1)}% Acc</span>
                      </div>
                      <button
                        onClick={() => navigate(`/results/${item.attemptId}`, { state: { result: item } })}
                        className="px-3 py-1.5 rounded-lg bg-[#0F4C81] text-white font-bold text-xs"
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
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-[var(--text-main)]">Exam-Wise Performance Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {examSummaries.map((ex) => (
                <div key={ex.exam} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs text-[#0F4C81]">{ex.exam}</span>
                    <span className="text-[10px] font-bold text-slate-500">{ex.testsTaken} Tests Taken</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Avg Score</span>
                      <span className="font-mono text-sm font-bold text-[var(--text-main)]">{ex.avgScore}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Avg Accuracy</span>
                      <span className="font-mono text-sm font-bold text-emerald-600">{ex.avgAccuracy}%</span>
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
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-base font-extrabold text-[var(--text-main)]">Weak Topics Identified</h2>
            </div>

            {weakTopics.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                ✓ No weak topics detected! Your overall accuracy across attempted questions is above 70%.
              </div>
            ) : (
              <div className="space-y-3">
                {weakTopics.map((wt) => (
                  <div key={wt.topicName} className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-slate-100">
                      <span>{wt.topicName}</span>
                      <span className="text-rose-600 font-mono">{wt.accuracy}%</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {wt.sectionName} • {wt.questionsAttempted} Qs attempted
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Practice */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-[var(--text-main)]">Recommended Practice</h2>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-500 text-white uppercase">
                    Target Practice
                  </span>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">{rec.topicName}</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">{rec.reason}</p>
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
