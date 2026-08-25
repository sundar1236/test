import React from 'react';
import { useApp } from '../context/AppContext';
import { initialMockTests } from '../data/mockData';
import {
  HelpCircle,
  CheckCircle2,
  Plus,
  FolderKanban,
  FileText,
  Clock,
  Archive,
  CheckSquare,
  History,
  Edit,
  Play
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { questions } = useApp();
  const navigate = useNavigate();

  // Lifecycle breakdown counts
  const draftCount = questions.filter((q) => q.status === 'draft').length;
  const reviewCount = questions.filter((q) => q.status === 'pending' || q.status === 'under_review').length;
  const validatedCount = questions.filter((q) => q.status === 'validated').length;
  const publishedCount = questions.filter((q) => q.status === 'approved' || q.status === 'published' || !q.status).length;
  const archivedCount = questions.filter((q) => q.status === 'rejected' || q.status === 'archived').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Operational Admin Control Panel</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Exam series creation, question lifecycle management, metadata configuration, AI validation queue, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate('/admin/categories')}
            className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-card)] font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <FolderKanban className="w-4 h-4 text-[#0F4C81] dark:text-[#38BDF8]" /> Metadata & Topics
          </button>
          <button
            onClick={() => navigate('/admin/exam-builder')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Exam / Mock Test
          </button>
          <button
            onClick={() => navigate('/admin/questions')}
            className="px-4 py-2.5 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>

      {/* Mock Test Series Management & Edit Table */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-extrabold text-[var(--text-main)] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0F4C81] dark:text-[#38BDF8]" /> Active Exam Series & Live Mock Tests
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Edit exam configurations, section durations, question counts, and marking rules.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/exam-builder')}
            className="px-3 py-1.5 bg-[#0F4C81] text-white font-extrabold text-xs rounded-xl flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Create Exam
          </button>
        </div>

        <div className="space-y-3">
          {initialMockTests.map((test) => (
            <div
              key={test.id}
              className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#0F4C81]/15 text-[#0F4C81] dark:text-[#38BDF8]">
                    {test.exam}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">{test.durationMinutes} Mins • {test.totalQuestions} Qs • {test.totalMarks} Marks</span>
                </div>
                <h3 className="font-bold text-sm text-[var(--text-main)]">{test.title}</h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/admin/exam-builder/${test.id}`)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--bg-main)] text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5 text-[#0F4C81]" /> Edit Exam
                </button>
                <button
                  onClick={() => navigate(`/mock-test/${test.id}`)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 text-xs font-bold flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5" /> Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question Lifecycle Status Breakdown Cards */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Question Bank Lifecycle Status
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Total Bank</span>
            <div className="text-2xl font-extrabold text-[var(--text-main)]">{questions.length}</div>
            <span className="text-[10px] text-[var(--text-muted)]">All Records</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <FileText className="w-3 h-3" /> Drafts
            </span>
            <div className="text-2xl font-extrabold text-slate-600 dark:text-slate-300">{draftCount}</div>
            <span className="text-[10px] text-[var(--text-muted)]">In Progress</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
            <span className="text-[10px] font-bold text-amber-600 uppercase flex items-center gap-1">
              <Clock className="w-3 h-3" /> Under Review
            </span>
            <div className="text-2xl font-extrabold text-amber-600">{reviewCount}</div>
            <span className="text-[10px] text-[var(--text-muted)]">Needs Review</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
            <span className="text-[10px] font-bold text-purple-600 uppercase flex items-center gap-1">
              <CheckSquare className="w-3 h-3" /> Validated
            </span>
            <div className="text-2xl font-extrabold text-purple-600">{validatedCount}</div>
            <span className="text-[10px] text-[var(--text-muted)]">Ready to Publish</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Published
            </span>
            <div className="text-2xl font-extrabold text-emerald-600">{publishedCount}</div>
            <span className="text-[10px] text-[var(--text-muted)]">Live in Mocks</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1">
            <span className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1">
              <Archive className="w-3 h-3" /> Archived
            </span>
            <div className="text-2xl font-extrabold text-rose-500">{archivedCount}</div>
            <span className="text-[10px] text-[var(--text-muted)]">Inactive</span>
          </div>

        </div>
      </div>

      {/* Operational Quick Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4 hover:border-[#0F4C81]/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8] flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--text-main)]">Question Bank Management</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Search, filter, paginate, edit, and create questions across SBI, IBPS, RBI, and RRB Clerk series.
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
            <h3 className="font-bold text-base text-[var(--text-main)]">Review & AI Validation Queue</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Audit draft questions, compare source vs AI answers with confidence metrics, and approve for publishing.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/validation')}
            className="w-full py-2.5 rounded-xl border border-purple-500/30 text-purple-600 dark:text-purple-400 font-bold text-xs hover:bg-purple-500/10 transition-colors"
          >
            Process Queue ({reviewCount}) →
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4 hover:border-[#0F4C81]/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--text-main)]">Exam & Topic Metadata</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Configure exam titles (SBI/IBPS/RBI/RRB), subject sections, and hierarchical parent-child topic structures.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/categories')}
            className="w-full py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors"
          >
            Configure Metadata →
          </button>
        </div>

      </div>

    </div>
  );
};
