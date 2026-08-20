import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { progressService } from '../services/progressService';
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
  Cell,
  Legend
} from 'recharts';
import { LineChart as LineIcon, BarChart2, PieChart as PieIcon, Sparkles, AlertTriangle, CheckCircle2, Trophy } from 'lucide-react';

export const PerformanceAnalytics: React.FC = () => {
  const { testAttempts } = useApp();

  // Score Progression Trend Data
  const scoreTrendData = useMemo(() => {
    if (!testAttempts.length) return [];
    return testAttempts.slice().reverse().map((att, idx) => ({
      name: `Mock ${idx + 1}`,
      Score: att.score,
      Accuracy: att.accuracy,
      Percentile: att.percentile,
    }));
  }, [testAttempts]);

  // Section Performance Breakdown
  const sectionPerformanceData = useMemo(() => {
    return progressService.calculateSectionPerformance(testAttempts);
  }, [testAttempts]);

  // Topic Performance Breakdown
  const topicPerformanceData = useMemo(() => {
    return progressService.calculateTopicPerformance(testAttempts);
  }, [testAttempts]);

  // Weak Topics
  const weakTopics = useMemo(() => {
    return progressService.identifyWeakTopics(testAttempts);
  }, [testAttempts]);

  // Exam-Specific Breakdown
  const examSummaries = useMemo(() => {
    return progressService.calculateExamProgressSummaries(testAttempts);
  }, [testAttempts]);

  // Pie Chart Data
  const totalCorrect = testAttempts.reduce((acc, c) => acc + c.correctAnswers, 0);
  const totalWrong = testAttempts.reduce((acc, c) => acc + c.wrongAnswers, 0);
  const totalSkipped = testAttempts.reduce((acc, c) => acc + c.skippedQuestions, 0);

  const pieData = [
    { name: 'Correct', value: totalCorrect || 1, color: '#22C55E' },
    { name: 'Wrong', value: totalWrong || 0, color: '#EF4444' },
    { name: 'Skipped', value: totalSkipped || 0, color: '#94A3B8' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Performance Analytics & Diagnostics</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Historical analysis of your accuracy, speed, sectional strengths, and weak topic masteries.
        </p>
      </div>

      {/* Actionable Weak Area Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0F4C81]/10 to-[#2563EB]/10 border border-[#0F4C81]/20 space-y-3">
        <div className="flex items-center gap-2 text-[#0F4C81] dark:text-[#38BDF8] font-bold text-sm">
          <Sparkles className="w-4 h-4" /> Algorithmic Performance Summary
        </div>
        <p className="text-xs text-[var(--text-main)] leading-relaxed font-medium">
          {weakTopics.length > 0 ? (
            <>
              Your primary weak area is <strong className="text-rose-600 font-extrabold">{weakTopics[0].topicName}</strong> with an accuracy of {weakTopics[0].accuracy}%. Focus practice on this topic to raise your overall mock percentile.
            </>
          ) : (
            <>
              Excellent work! Your overall accuracy across mock tests is well above target benchmarks. Continue taking full mock tests to build stamina.
            </>
          )}
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: Score & Accuracy Progression */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
              <LineIcon className="w-4 h-4 text-[#0F4C81] dark:text-[#38BDF8]" /> Score & Accuracy Progression
            </h2>
          </div>

          <div className="h-64 w-full">
            {scoreTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Complete a mock test to see progression charts</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreTrendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="Score" stroke="#0F4C81" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Accuracy" stroke="#22C55E" strokeWidth={2} strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bar Chart: Sectional Scores */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#0F4C81] dark:text-[#38BDF8]" /> Sectional Accuracy (%)
            </h2>
          </div>

          <div className="h-64 w-full">
            {sectionPerformanceData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No sectional data recorded yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="sectionName" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="#2563EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Exam-Specific Breakdown Cards */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
        <h2 className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" /> Exam Series Performance Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {examSummaries.map((ex) => (
            <div key={ex.exam} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-xs text-[#0F4C81]">{ex.exam}</span>
                <span className="text-[10px] font-bold text-slate-400">{ex.testsTaken} Tests</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Score:</span>
                  <strong className="font-mono">{ex.avgScore}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Accuracy:</span>
                  <strong className="font-mono text-emerald-600">{ex.avgAccuracy}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Best Score:</span>
                  <strong className="font-mono text-amber-500">{ex.bestScore}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Mastery Heatmap Table */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
        <h2 className="font-bold text-base text-[var(--text-main)]">Topic Mastery Breakdown</h2>

        {topicPerformanceData.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No topic statistics recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topicPerformanceData.map((top) => (
              <div key={top.topicName} className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-[var(--text-main)]">{top.topicName}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">{top.attemptedQuestions} Qs attempted</div>
                </div>
                <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded ${
                  top.performanceLevel === 'High' ? 'bg-emerald-500/10 text-emerald-600' :
                  top.performanceLevel === 'Good' ? 'bg-blue-500/10 text-blue-600' :
                  'bg-rose-500/10 text-rose-600'
                }`}>
                  {top.accuracy}% {top.performanceLevel}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
