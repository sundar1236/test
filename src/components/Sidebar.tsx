import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  FileCheck2,
  LineChart,
  Bookmark,
  User,
  BrainCircuit,
  CheckCircle2,
  Settings,
  History
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { role } = useApp();
  const location = useLocation();

  const studentNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Question Bank', path: '/questions', icon: BookOpen },
    { label: 'Topic Tests', path: '/topics', icon: FolderKanban },
    { label: 'Mock Tests', path: '/mock-tests', icon: FileCheck2 },
    { label: 'Attempt History', path: '/attempts', icon: History },
    { label: 'Performance', path: '/performance', icon: LineChart },
    { label: 'Practice Mode', path: '/practice', icon: BrainCircuit },
    { label: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const adminNavItems = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Questions Manager', path: '/admin/questions', icon: BookOpen },
    { label: 'Bulk Ingestion Center', path: '/admin/import', icon: FolderKanban },
    { label: 'Exam & Topic Metadata', path: '/admin/categories', icon: FolderKanban },
    { label: 'Tests Management', path: '/admin/tests', icon: FileCheck2 },
    { label: 'Review & Validation Queue', path: '/admin/validation', icon: CheckCircle2 },
    { label: 'System Audit Logs', path: '/admin/analytics', icon: History },
  ];

  const isAdminOrReviewer = role === 'admin' || role === 'super_admin' || role === 'question_reviewer';
  const navItems = isAdminOrReviewer
    ? [...adminNavItems, { label: 'UX & Engineering Ref', path: '/design-system', icon: Settings }]
    : studentNavItems;

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[var(--border-color)] bg-[var(--bg-sidebar)] min-h-[calc(100vh-4rem)] p-4 shrink-0 transition-colors">
        <div className="space-y-6 flex-1">
          <div>
            <p className="px-3 text-[11px] font-bold tracking-wider text-[var(--text-muted)] uppercase mb-2">
              {isAdminOrReviewer ? `${role.replace('_', ' ')} Controls` : 'Student Navigation'}
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-[#0F4C81] text-white shadow-sm font-semibold'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Target Exam Widget */}
        {role === 'student' && (
          <div className="p-3.5 rounded-xl bg-[#0F4C81]/5 border border-[#0F4C81]/15 mt-auto">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#0F4C81] dark:text-[#38BDF8]">Target Exam</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8]">2024-25</span>
            </div>
            <p className="text-xs font-semibold text-[var(--text-main)]">SBI Clerk & IBPS Clerk</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">Target Score: 85+ / 100</p>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card)] border-t border-[var(--border-color)] px-2 py-1.5 flex justify-around items-center backdrop-blur-md">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-[#0F4C81] dark:text-[#38BDF8] font-bold'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="truncate max-w-[60px]">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
