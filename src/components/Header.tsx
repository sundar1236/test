import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Sun, Moon, LogIn, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { role, setRole, theme, toggleTheme, userProfile } = useApp();
  const navigate = useNavigate();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    setRole(newRole);
    if (newRole === 'guest') {
      navigate('/');
    } else if (newRole === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--bg-card)]/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0F4C81] to-[#2563EB] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[var(--text-main)] leading-none">
              Bank<span className="text-[#0F4C81] dark:text-[#38BDF8]">Clerk</span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
              Mock Test Platform
            </span>
          </div>
        </Link>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Dev Role Switcher Badge */}
          <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-medium">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="hidden lg:inline text-[var(--text-muted)]">Role:</span>
            <select
              value={role}
              onChange={handleRoleChange}
              className="bg-transparent font-bold text-[var(--text-main)] outline-none cursor-pointer capitalize text-xs"
            >
              <option value="guest" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Guest User</option>
              <option value="student" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Student</option>
              <option value="admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Admin</option>
            </select>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors shrink-0"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Status / Login Quick Actions */}
          {role === 'guest' ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setRole('student')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[var(--text-main)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-main)] transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
              <button
                onClick={() => {
                  setRole('student');
                  navigate('/dashboard');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0F4C81] hover:bg-[#0B3A64] rounded-lg shadow-sm transition-colors"
              >
                Start Free Test
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-color)] shrink-0">
              <div className="w-8 h-8 rounded-full bg-[#0F4C81]/15 text-[#0F4C81] dark:text-[#38BDF8] flex items-center justify-center font-black text-xs border border-[#0F4C81]/30">
                {userProfile.name.charAt(0)}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-[var(--text-main)] leading-tight">{userProfile.name}</span>
                <span className="text-[10px] text-[var(--text-muted)] capitalize font-semibold">{role}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
