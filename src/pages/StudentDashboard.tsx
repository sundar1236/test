import React from 'react';
import { useApp } from '../context/AppContext';
import { initialMockTests, initialTopicMetas } from '../data/mockData';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Target,
  BarChart3,
  Bookmark,
  Play,
  ArrowUpRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { userProfile, testAttempts, bookmarks } = useApp();
  const navigate = useNavigate();

  const recentAttempts = testAttempts.slice(0, 3);
  const featuredTest = initialMockTests[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Top Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0F4C81] to-[#2563EB] text-white shadow-lg">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" /> SBI & IBPS Clerk 2024 Prep
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome Back, {userProfile.name}! 👋
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
            You're in the top <span className="font-bold text-white">5% percentile</span> of aspirants this week. Keep up your daily momentum!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate(`/mock-test/${featuredTest.id}`)}
            className="px-5 py-3 rounded-xl bg-white text-[#0F4C81] font-bold text-sm shadow-md hover:bg-slate-100 transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" /> Continue Quick Test
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Tests Attempted</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-main)]">
            {testAttempts.length + userProfile.testsTaken}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +2 tests this week
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Average Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-main)]">
            {testAttempts.length > 0
              ? (testAttempts.reduce((acc, curr) => acc + curr.score, 0) / testAttempts.length).toFixed(1)
              : '72.5'}
            <span className="text-xs text-[var(--text-muted)] font-normal"> / 100</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +4.2 points gain
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Accuracy</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-main)]">
            {userProfile.avgAccuracy}%
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Target: 85%+
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Bookmarks</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-main)]">
            {bookmarks.length}
          </div>
          <Link to="/bookmarks" className="text-[11px] text-[#0F4C81] dark:text-[#38BDF8] font-semibold hover:underline block">
            Review saved questions →
          </Link>
        </div>

      </div>

      {/* Main Grid: Strong & Weak Areas + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Strong vs Weak Areas */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-[var(--text-main)]">Topic Performance</h2>
            <Link to="/performance" className="text-xs font-semibold text-[#0F4C81] dark:text-[#38BDF8] hover:underline">
              Detailed Analysis
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Strong Areas (&gt;80%)
              </span>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--text-main)]">Syllogism & Inequalities</span>
                  <span className="font-mono font-bold text-emerald-600">92% Acc</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--text-main)]">Banking Terms & RBI</span>
                  <span className="font-mono font-bold text-emerald-600">88% Acc</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                <AlertCircle className="w-3.5 h-3.5" /> Weak Areas (&lt;65%)
              </span>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--text-main)]">Seating & Puzzles</span>
                  <span className="font-mono font-bold text-amber-600">58% Acc</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--text-main)]">Time, Speed & Work</span>
                  <span className="font-mono font-bold text-amber-600">62% Acc</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Attempts & Recommended Tests */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-[var(--text-main)]">Recent Test Activity</h2>
            <Link to="/mock-tests" className="text-xs font-semibold text-[#0F4C81] dark:text-[#38BDF8] hover:underline">
              View All Mock Tests
            </Link>
          </div>

          <div className="space-y-3">
            {recentAttempts.map((attempt) => (
              <div
                key={attempt.attemptId}
                className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] hover:border-[#0F4C81]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8] font-bold">
                      {attempt.exam}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">{attempt.dateCompleted}</span>
                  </div>
                  <h3 className="font-bold text-sm text-[var(--text-main)]">{attempt.testTitle}</h3>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-[#0F4C81] dark:text-[#38BDF8]">
                      {attempt.score.toFixed(1)} / {attempt.maxScore}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] font-medium">
                      {attempt.accuracy.toFixed(1)}% Accuracy • {attempt.percentile}%ile
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/results/${attempt.attemptId}`)}
                    className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] transition-colors flex items-center gap-1 shrink-0"
                  >
                    Analysis <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
