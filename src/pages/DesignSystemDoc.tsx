import React from 'react';
import { ShieldCheck, Palette, Type, Layout, Sliders, Layers, Smartphone, Monitor } from 'lucide-react';

export const DesignSystemDoc: React.FC = () => {
  const colorTokens = [
    { name: 'Primary (Banking Blue)', value: '#0F4C81', usage: 'Headers, Primary Buttons, Active Navigation' },
    { name: 'Secondary', value: '#2563EB', usage: 'Interactive highlights, badges, charts' },
    { name: 'Success (Answered)', value: '#22C55E', usage: 'Correct answers, high accuracy, palette answered state' },
    { name: 'Warning (Review)', value: '#F59E0B', usage: 'Medium accuracy, review indicators, bookmarks' },
    { name: 'Error (Not Answered)', value: '#EF4444', usage: 'Wrong answers, not answered palette state' },
    { name: 'Background Light', value: '#F8FAFC', usage: 'Light theme platform canvas background' },
    { name: 'Text Dark', value: '#0F172A', usage: 'High contrast readable question & body typography' },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8] text-xs font-bold uppercase tracking-wider mb-2">
          UX & Engineering Reference
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--text-main)] tracking-tight">Design System & Architecture Specification</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Complete guidelines for design tokens, typography, component standards, RBAC access matrix, and responsive breakpoints.
        </p>
      </div>

      {/* Color Tokens Section */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#0F4C81] dark:text-[#38BDF8]" /> Color Tokens System
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorTokens.map((token, i) => (
            <div key={i} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl shadow-xs border border-black/10 shrink-0"
                style={{ backgroundColor: token.value }}
              />
              <div>
                <div className="font-bold text-sm text-[var(--text-main)]">{token.name}</div>
                <div className="font-mono text-xs text-[var(--text-muted)]">{token.value}</div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{token.usage}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography Scale Section */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
          <Type className="w-5 h-5 text-[#0F4C81] dark:text-[#38BDF8]" /> Typography & Readability Scale
        </h2>

        <div className="space-y-4 text-[var(--text-main)]">
          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
            <span className="text-xs font-mono text-[var(--text-muted)] block mb-1">Heading 1 • Inter/Poppins Bold • 28px/36px</span>
            <span className="text-3xl font-extrabold tracking-tight">SBI Clerk Prelims Speed Booster Mock</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
            <span className="text-xs font-mono text-[var(--text-muted)] block mb-1">Question Body • Inter SemiBold • 16px (High Exam Contrast)</span>
            <span className="text-base font-semibold leading-relaxed">
              If 40% of a number is equal to two-fifths of another number, what is the ratio between the first and the second number?
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
            <span className="text-xs font-mono text-[var(--text-muted)] block mb-1">Option & Button Label • Inter Medium • 14px</span>
            <span className="text-sm font-medium">Option A: 1:1 Ratio</span>
          </div>
        </div>
      </section>

      {/* Access Control Matrix */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#0F4C81] dark:text-[#38BDF8]" /> Role Access Matrix (RBAC)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                <th className="py-3 px-3">Platform Module</th>
                <th className="py-3 px-3 text-slate-500">Guest User</th>
                <th className="py-3 px-3 text-[#0F4C81]">Student Role</th>
                <th className="py-3 px-3 text-purple-600">Admin Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] font-medium text-[var(--text-main)]">
              <tr>
                <td className="py-3 px-3 font-bold">Public Landing & Sample Tests</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Allowed</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Allowed</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Allowed</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold">Mock Exam Simulator</td>
                <td className="py-3 px-3 text-rose-500 font-bold">Redirect to Auth</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Allowed</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Allowed</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold">Performance Analytics & Bookmarks</td>
                <td className="py-3 px-3 text-rose-500 font-bold">Blocked</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Allowed</td>
                <td className="py-3 px-3 text-emerald-600 font-bold">Allowed</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold">Admin Panel & Question Management</td>
                <td className="py-3 px-3 text-rose-500 font-bold">Blocked</td>
                <td className="py-3 px-3 text-rose-500 font-bold">Blocked</td>
                <td className="py-3 px-3 text-purple-600 font-extrabold">Full Access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Responsive Breakpoint Documentation */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-[#0F4C81] dark:text-[#38BDF8]" /> Responsive Breakpoint Standards
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2">
            <div className="font-bold text-sm text-[var(--text-main)] flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-600" /> Mobile (&lt; 768px)
            </div>
            <p className="text-[var(--text-muted)]">Bottom navigation bar, collapsible question palette drawers, single column metric cards.</p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2">
            <div className="font-bold text-sm text-[var(--text-main)] flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-purple-600" /> Tablet (768px - 1024px)
            </div>
            <p className="text-[var(--text-muted)]">Collapsible left sidebar, 2-column dashboard grids, split-screen exam view.</p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-2">
            <div className="font-bold text-sm text-[var(--text-main)] flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-emerald-600" /> Desktop (&gt; 1024px)
            </div>
            <p className="text-[var(--text-muted)]">Full 256px Left Sidebar, 4-column analytics metrics, sticky exam question palette on the right.</p>
          </div>
        </div>
      </section>

    </div>
  );
};
