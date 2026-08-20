import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  calculateDashboardStats,
  calculatePerformanceTrends,
  calculateSectionAnalytics,
  calculateTopicAnalytics,
  calculateTimeAnalytics,
  compareAttempts,
  generateLearningRecommendations,
  generatePerformanceInsights
} from '../services/analyticsEngine';
import { ExamCategory } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  LineChart as LineIcon,
  BarChart2,
  Sparkles,
  Award,
  Clock,
  Target,
  ArrowRight,
  BrainCircuit,
  Filter,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PerformanceAnalytics: React.FC = () => {
  const { testAttempts } = useApp();
  const navigate = useNavigate();

  const [examFilter, setExamFilter] = useState<ExamCategory | 'all'>('all');
  const [phaseFilter, setPhaseFilter] = useState<'prelims' | 'mains' | 'all'>('all');
  const [compareAttemptAId, setCompareAttemptAId] = useState<string>('');
  const [compareAttemptBId, setCompareAttemptBId] = useState<string>('');

  // Derived Analytics Data
  const stats = useMemo(() => calculateDashboardStats(testAttempts), [testAttempts]);
  const trends = useMemo(
    () => calculatePerformanceTrends(testAttempts, examFilter, phaseFilter),
    [testAttempts, examFilter, phaseFilter]
  );
  const sectionAnalytics = useMemo(() => calculateSectionAnalytics(testAttempts), [testAttempts]);
  const topicAnalytics = useMemo(() => calculateTopicAnalytics(testAttempts), [testAttempts]);
  const timeAnalytics = useMemo(() => calculateTimeAnalytics(testAttempts), [testAttempts]);
  const recommendations = useMemo(() => generateLearningRecommendations(testAttempts), [testAttempts]);
  const insights = useMemo(() => generatePerformanceInsights(testAttempts), [testAttempts]);

  // Selected attempt comparison
  const comparison = useMemo(() => {
    if (!compareAttemptAId || !compareAttemptBId) return null;
    const attA = testAttempts.find((a) => a.attemptId === compareAttemptAId);
    const attB = testAttempts.find((a) => a.attemptId === compareAttemptBId);
    if (!attA || !attB) return null;
    return compareAttempts(attA, attB);
  }, [testAttempts, compareAttemptAId, compareAttemptBId]);

  if (!testAttempts || testAttempts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-6 my-12 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8] flex items-center justify-center mx-auto">
          <BrainCircuit className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="text-xl font-bold text-[var(--text-main)]">Insufficient Test History</h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            You haven't completed enough test attempts to generate performance trends yet. Complete a few mock tests to unlock deep analytics, section breakdowns, and personalized topic mastery insights.
          </p>
        </div>
        <button
          onClick={() => navigate('/mock-tests')}
          className="px-6 py-3 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-black text-xs shadow-md transition-all inline-flex items-center gap-2"
        >
          Browse Available Mock Tests <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Top Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Advanced Learning & Performance Analytics</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Data-backed metrics on your score progression, topic mastery, section pacing, and improvement trends.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-bold">
            <Filter className="w-3.5 h-3.5 text-[#0F4C81] dark:text-[#38BDF8]" />
            <span className="text-[var(--text-muted)]">Exam:</span>
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value as any)}
              className="bg-transparent font-extrabold text-[var(--text-main)] focus:outline-none"
            >
              <option value="all">All Banking Exams</option>
              <option value="SBI Clerk">SBI Clerk</option>
              <option value="IBPS Clerk">IBPS Clerk</option>
              <option value="RBI Assistant">RBI Assistant</option>
              <option value="RRB Clerk">RRB Clerk</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-bold">
            <Layers className="w-3.5 h-3.5 text-[#0F4C81] dark:text-[#38BDF8]" />
            <span className="text-[var(--text-muted)]">Phase:</span>
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value as any)}
              className="bg-transparent font-extrabold text-[var(--text-main)] focus:outline-none"
            >
              <option value="all">All Phases</option>
              <option value="prelims">Prelims</option>
              <option value="mains">Mains</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Average Score</span>
          <div className="text-2xl font-black text-[#0F4C81] dark:text-[#38BDF8]">{stats.avgScore}</div>
          <span className="text-[10px] font-bold text-slate-500">Best: {stats.bestScore} marks</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Average Accuracy</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.avgAccuracy}%</div>
          <span className="text-[10px] font-bold text-slate-500">{stats.correctAnswers} correct</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Solving Speed</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{timeAnalytics.avgTimePerQuestionSeconds}s</div>
          <span className="text-[10px] font-bold text-slate-500">per question</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Tests Completed</span>
          <div className="text-2xl font-black text-[var(--text-main)]">{stats.completedTests}</div>
          <span className="text-[10px] font-bold text-slate-500">{stats.questionsAttempted} Qs solved</span>
        </div>
      </div>

      {/* Insights & Learning Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Derived Insights */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
          <h2 className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0F4C81] dark:text-[#38BDF8]" /> Data-Backed Insights
          </h2>

          <div className="space-y-3">
            {insights.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic">
                No specific trends detected yet. Complete another mock test to compare performance.
              </p>
            ) : (
              insights.map((ins) => (
                <div
                  key={ins.id}
                  className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-start gap-3"
                >
                  <div className={`p-2 rounded-lg shrink-0 ${
                    ins.type === 'improvement' ? 'bg-emerald-500/10 text-emerald-600' :
                    ins.type === 'strength' ? 'bg-purple-500/10 text-purple-600' :
                    'bg-amber-500/10 text-amber-600'
                  }`}>
                    {ins.type === 'improvement' ? <TrendingUp className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--text-main)] leading-relaxed">{ins.message}</p>
                    <span className="text-[10px] font-bold text-[var(--text-muted)]">{ins.metricLabel}: {ins.metricValue}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Personalized Practice Recommendations */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
          <h2 className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-600" /> Personalized Practice Recommendations
          </h2>

          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 font-extrabold text-[10px]">
                      {rec.sectionName}
                    </span>
                    <span className="font-extrabold text-xs text-[var(--text-main)] truncate">{rec.topicName}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] leading-snug truncate">{rec.reason}</p>
                </div>

                <button
                  onClick={() => navigate(`/practice?type=${rec.type}&topic=${encodeURIComponent(rec.topicName)}`)}
                  className="px-3 py-1.5 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-bold text-[11px] shrink-0 shadow-xs flex items-center gap-1"
                >
                  {rec.actionText} <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Chronological Score & Accuracy Progression Line Chart */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
            <LineIcon className="w-4 h-4 text-[#0F4C81] dark:text-[#38BDF8]" /> Chronological Score & Accuracy Progression
          </h2>
          <span className="text-xs font-bold text-[var(--text-muted)]">{trends.length} Tests Plotted</span>
        </div>

        <div className="h-72 w-full">
          {trends.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)]">No data matching filter criteria</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="formattedDate" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#0F4C81" strokeWidth={3} name="Score (Marks)" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="accuracy" stroke="#22C55E" strokeWidth={2} name="Accuracy (%)" strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Section Performance Bar Chart & Breakdown */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
        <h2 className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#0F4C81] dark:text-[#38BDF8]" /> Sectional Accuracy & Pacing Breakdown
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionAnalytics}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="sectionName" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="accuracy" fill="#2563EB" radius={[6, 6, 0, 0]} name="Accuracy %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {sectionAnalytics.map((sec) => (
              <div
                key={sec.sectionName}
                className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-[var(--text-main)]">{sec.sectionName}</span>
                  <div className="text-[10px] text-[var(--text-muted)] font-semibold">
                    {sec.correctAnswers} Correct • {sec.incorrectAnswers} Incorrect
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded ${
                    sec.accuracy >= 75 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {sec.accuracy}%
                  </span>
                  <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                    ~{sec.avgTimePerQuestionSeconds}s / Q
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Topic Mastery Heatmap */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-[var(--text-main)]">Topic Mastery Status</h2>
            <p className="text-xs text-[var(--text-muted)]">Requires a minimum sample size of 5 attempted questions per topic.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topicAnalytics.map((top) => (
            <div
              key={top.topicName}
              className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-purple-600 uppercase">{top.sectionName}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                  top.masteryStatus === 'Strong' ? 'bg-emerald-500/15 text-emerald-600' :
                  top.masteryStatus === 'Improving' ? 'bg-blue-500/15 text-blue-600' :
                  top.masteryStatus === 'Needs Practice' ? 'bg-amber-500/15 text-amber-600' :
                  'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {top.masteryStatus}
                </span>
              </div>

              <div className="font-bold text-xs text-[var(--text-main)] truncate">{top.topicName}</div>

              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-muted)] pt-1 border-t border-[var(--border-color)]">
                <span>Overall: {top.overallAccuracy}%</span>
                <span>Recent: {top.recentAccuracy}%</span>
                <span>{top.attemptedQuestions} Qs</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Attempt Comparison Tool */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
        <h2 className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#0F4C81] dark:text-[#38BDF8]" /> Side-by-Side Test Attempt Comparison
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 text-xs">
            <label className="font-bold text-[var(--text-muted)]">Attempt A (Baseline):</label>
            <select
              value={compareAttemptAId}
              onChange={(e) => setCompareAttemptAId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-main)] font-bold"
            >
              <option value="">Select Baseline Attempt...</option>
              {testAttempts.map((a) => (
                <option key={a.attemptId} value={a.attemptId}>
                  {a.testTitle} ({a.score} marks - {a.dateCompleted})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-[var(--text-muted)]">Attempt B (Comparison):</label>
            <select
              value={compareAttemptBId}
              onChange={(e) => setCompareAttemptBId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-main)] font-bold"
            >
              <option value="">Select Target Attempt...</option>
              {testAttempts.map((a) => (
                <option key={a.attemptId} value={a.attemptId}>
                  {a.testTitle} ({a.score} marks - {a.dateCompleted})
                </option>
              ))}
            </select>
          </div>
        </div>

        {comparison && (
          <div className="p-5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <span className="font-black text-sm text-[var(--text-main)]">Comparison Matrix</span>
              <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                comparison.isImprovement ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
              }`}>
                {comparison.isImprovement ? 'Score Increased' : 'Score Dropped'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Score Difference</span>
                <div className={`text-xl font-black ${comparison.scoreDiff >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {comparison.scoreDiff >= 0 ? `+${comparison.scoreDiff}` : comparison.scoreDiff}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Accuracy Delta</span>
                <div className={`text-xl font-black ${comparison.accuracyDiff >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {comparison.accuracyDiff >= 0 ? `+${comparison.accuracyDiff}%` : `${comparison.accuracyDiff}%`}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Correct Qs Diff</span>
                <div className="text-xl font-black text-[var(--text-main)]">
                  {comparison.correctDiff >= 0 ? `+${comparison.correctDiff}` : comparison.correctDiff}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Percentile Shift</span>
                <div className="text-xl font-black text-[#0F4C81] dark:text-[#38BDF8]">
                  {comparison.percentileDiff >= 0 ? `+${comparison.percentileDiff}` : comparison.percentileDiff}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
