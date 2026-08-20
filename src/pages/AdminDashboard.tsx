import React from 'react';
import { useApp } from '../context/AppContext';
import { initialMockTests } from '../data/mockData';
import {
  HelpCircle,
  FileCheck2,
  Users,
  CheckCircle2,
  TrendingUp,
  Plus,
  Upload,
  FolderKanban,
  FileText,
  Clock,
  Archive,
  Eye,
  CheckSquare,
  History
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
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Operational Admin Control Panel</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Question lifecycle management, metadata configuration, AI validation queue, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/categories')}
            className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-card)] font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <FolderKanban className="w-4 h-4 text-[#0F4C81] dark:text-[#38BDF8]" /> Metadata & Topics
          </button>
          <button
            onClick={() => navigate('/admin/validation')}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Validation Queue ({reviewCount})
          </button>
          <button
            onClick={() => navigate('/admin/questions')}
            className="px-4 py-2.5 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
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

      {/* Operational Activity Feed */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-[var(--text-main)] flex items-center gap-2">
            <History className="w-4 h-4 text-[#0F4C81] dark:text-[#38BDF8]" /> Recent Admin & System Operations Log
          </h2>
          <Link to="/admin/analytics" className="text-xs font-bold text-[#0F4C81] dark:text-[#38BDF8] hover:underline">
            View Audit History
          </Link>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-bold text-[var(--text-main)]">QUESTION_PUBLISHED</span>
              <span className="text-[var(--text-muted)]">• SBI Clerk Prelims Profit & Loss question</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">10 mins ago</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span className="font-bold text-[var(--text-main)]">AI_VALIDATION_COMPLETED</span>
              <span className="text-[var(--text-muted)]">• Confidence 94% on Reasoning Syllogism</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">45 mins ago</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="font-bold text-[var(--text-main)]">TOPIC_CREATED</span>
              <span className="text-[var(--text-muted)]">• Added sub-topic "Data Interpretation (Pie Charts)"</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">2 hours ago</span>
          </div>
        </div>
      </div>

    </div>
  );
};
