import React from 'react';
import { useApp } from '../context/AppContext';
import { initialMockTests } from '../data/mockData';
import {
  HelpCircle,
  FileCheck2,
  Users,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  Plus,
  Upload,
  Layers
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { questions } = useApp();
  const navigate = useNavigate();

  const pendingQuestions = questions.filter((q) => q.status === 'pending');
  const approvedQuestions = questions.filter((q) => q.status === 'approved' || !q.status);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Admin System Control Panel</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Manage question banks, mock exams, user activity, and automated AI validation queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/validation')}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Validation Queue ({pendingQuestions.length})
          </button>
          <button
            onClick={() => navigate('/admin/questions')}
            className="px-4 py-2.5 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Questions</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-main)]">
            {questions.length.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +120 added this week
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Active Tests</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-main)]">
            {initialMockTests.length + 12}
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-medium"> Across 4 Exam Series</p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Aspirants</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-main)]">48,250</div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +1,450 this month
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Queue</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-main)]">
            {pendingQuestions.length}
          </div>
          <Link to="/admin/validation" className="text-[11px] text-amber-600 font-bold hover:underline block">
            Process validation queue →
          </Link>
        </div>

      </div>

      {/* Admin Quick Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4 hover:border-[#0F4C81]/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8] flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--text-main)]">Question Bank Management</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Add, edit, filter, or bulk-import questions via CSV/Excel sheets into Quantitative, Reasoning, English, or GA.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/questions')}
            className="w-full py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors"
          >
            Manage Questions →
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4 hover:border-[#0F4C81]/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--text-main)]">AI Validation Queue</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Side-by-side comparison between source answers and AI verified explanations with confidence scores.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/validation')}
            className="w-full py-2.5 rounded-xl border border-purple-500/30 text-purple-600 dark:text-purple-400 font-bold text-xs hover:bg-purple-500/10 transition-colors"
          >
            Open Queue ({pendingQuestions.length}) →
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4 hover:border-[#0F4C81]/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--text-main)]">Mock Test Series Manager</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Configure exam durations, question limits, sectional rules, and publish live mock test series.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/tests')}
            className="w-full py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors"
          >
            Manage Test Series →
          </button>
        </div>

      </div>

    </div>
  );
};
