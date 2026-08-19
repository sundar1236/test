import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
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
import { LineChart as LineIcon, BarChart2, PieChart as PieIcon, Sparkles, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const PerformanceAnalytics: React.FC = () => {
  const { testAttempts } = useApp();

  // Score Trend Data
  const scoreTrendData = useMemo(() => {
    if (!testAttempts.length) return [];
    return testAttempts.slice().reverse().map((att, idx) => ({
      name: `Mock ${idx + 1}`,
      Score: att.score,
      Accuracy: att.accuracy,
      Percentile: att.percentile,
    }));
  }, [testAttempts]);

  // Section Wise Aggregated Scores
  const sectionChartData = [
    { section: 'Quantitative', Score: 28, Target: 32 },
    { section: 'Reasoning', Score: 32, Target: 33 },
    { section: 'English', Score: 21, Target: 26 },
    { section: 'General Awareness', Score: 34, Target: 36 },
  ];

  // Pie Chart Data for Answer Accuracy Distribution
  const totalCorrect = testAttempts.reduce((acc, c) => acc + c.correctAnswers, 0) || 76;
  const totalWrong = testAttempts.reduce((acc, c) => acc + c.wrongAnswers, 0) || 12;
  const totalSkipped = testAttempts.reduce((acc, c) => acc + c.skippedQuestions, 0) || 12;

  const pieData = [
    { name: 'Correct', value: totalCorrect, color: '#22C55E' },
    { name: 'Wrong', value: totalWrong, color: '#EF4444' },
    { name: 'Skipped', value: totalSkipped, color: '#94A3B8' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Performance Analytics & Insights</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          In-depth algorithmic analysis of your speed, accuracy, accuracy trends, and topic masteries.
        </p>
      </div>

      {/* AI Recommendation Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0F4C81]/10 to-[#2563EB]/10 border border-[#0F4C81]/20 space-y-3">
        <div className="flex items-center gap-2 text-[#0F4C81] dark:text-[#38BDF8] font-bold text-sm">
          <Sparkles className="w-4 h-4" /> Recommended Action Items
        </div>
        <p className="text-xs text-[var(--text-main)] leading-relaxed">
          Your Reasoning Ability accuracy is consistently high (90%+). To maximize your SBI Clerk score, allocate 30 mins daily to practice <span className="font-bold">Seating Arrangement Puzzles</span> and <span className="font-bold">Error Spotting in English</span> where accuracy currently dips below 65%.
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Line Chart: Score & Percentile Trend */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
              <LineIcon className="w-4 h-4 text-[#0F4C81] dark:text-[#38BDF8]" /> Score & Accuracy Progression
            </h2>
          </div>

          <div className="h-64 w-full">
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
          </div>
        </div>

        {/* Bar Chart: Section Performance vs Cutoff */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#0F4C81] dark:text-[#38BDF8]" /> Sectional Score vs Target
            </h2>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="section" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="Score" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Target" fill="#E2E8F0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Accuracy Distribution & Topic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pie Chart */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
          <h2 className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#0F4C81] dark:text-[#38BDF8]" /> Overall Accuracy Mix
          </h2>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Topic Analysis */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
          <h2 className="font-bold text-base text-[var(--text-main)]">Topic Mastery Heatmap</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-between">
              <div>
                <div className="font-bold text-[var(--text-main)]">Percentage & Ratio</div>
                <div className="text-[var(--text-muted)] text-[10px]">Quantitative Aptitude</div>
              </div>
              <span className="font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded">88% Mastered</span>
            </div>

            <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-between">
              <div>
                <div className="font-bold text-[var(--text-main)]">Syllogism & Coding</div>
                <div className="text-[var(--text-muted)] text-[10px]">Reasoning Ability</div>
              </div>
              <span className="font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded">94% Mastered</span>
            </div>

            <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-between">
              <div>
                <div className="font-bold text-[var(--text-main)]">Seating Arrangements</div>
                <div className="text-[var(--text-muted)] text-[10px]">Reasoning Ability</div>
              </div>
              <span className="font-mono font-bold text-amber-600 bg-amber-500/10 px-2 py-1 rounded">58% Needs Work</span>
            </div>

            <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-between">
              <div>
                <div className="font-bold text-[var(--text-main)]">Cloze Test & Error Spotting</div>
                <div className="text-[var(--text-muted)] text-[10px]">English Language</div>
              </div>
              <span className="font-mono font-bold text-amber-600 bg-amber-500/10 px-2 py-1 rounded">62% Needs Work</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
