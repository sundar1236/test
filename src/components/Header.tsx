import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Sun, Moon, Shield, User, LogIn, ChevronDown, Check, BookOpen } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--bg-card)]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F4C81] to-[#2563EB] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-[var(--text-main)] leading-none">
              Bank<span className="text-[#0F4C81] dark:text-[#38BDF8]">Clerk</span>
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              Mock Test Platform
            </span>
          </div>
        </Link>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">

          {/* Dev Role Switcher Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-medium">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[var(--text-muted)]">Dev Mode Role:</span>
            <select
              value={role}
              onChange={handleRoleChange}
              className="bg-transparent font-semibold text-[var(--text-main)] outline-none cursor-pointer capitalize"
            >
              <option value="guest" className="text-slate-900">Guest User</option>
              <option value="student" className="text-slate-900">Student</option>
              <option value="admin" className="text-slate-900">Admin</option>
            </select>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Status / Login Quick Actions */}
          {role === 'guest' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRole('student')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-main)] transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
              <button
                onClick={() => {
                  setRole('student');
                  navigate('/dashboard');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0F4C81] hover:bg-[#0B3A64] rounded-lg shadow-sm transition-colors"
              >
                Start Free Test
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 pl-2 border-l border-[var(--border-color)]">
              <div className="w-8 h-8 rounded-full bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8] flex items-center justify-center font-bold text-sm">
                {userProfile.name.charAt(0)}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-[var(--text-main)] leading-tight">{userProfile.name}</span>
                <span className="text-[10px] text-[var(--text-muted)] capitalize font-medium">{role}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
