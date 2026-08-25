import React, { useState } from 'react';
import { useDesign } from '../context/DesignContext';
import { designConfigService } from '../services/designConfigService';
import {
  Palette,
  Type,
  Layout,
  Sliders,
  Eye,
  Send,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  Clock,
  Smartphone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  DesignSystemConfig,
  DesignConfigurationRecord,
  DEFAULT_DESIGN_SYSTEM_CONFIG
} from '../types/designConfig';

export const AdminDesignSettings: React.FC = () => {
  const { designConfig, setPreviewConfig, refreshDesignConfig } = useDesign();

  const [activeTab, setActiveTab] = useState<'branding' | 'colors' | 'typography' | 'exam_ui' | 'preview'>('colors');
  const [config, setConfig] = useState<DesignSystemConfig>(designConfig);
  const [versionNumber, setVersionNumber] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const updateColor = (key: keyof typeof config.colors, value: string) => {
    setConfig((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value,
      },
    }));
  };

  const handleTogglePreview = (enable: boolean) => {
    if (enable) {
      setPreviewConfig(config);
      showToast('Live preview enabled across platform!');
    } else {
      setPreviewConfig(null);
      showToast('Exited preview mode.');
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    const record: DesignConfigurationRecord = {
      name: `Design Draft v${versionNumber}`,
      status: 'draft',
      versionNumber,
      configJson: config,
    };
    const res = await designConfigService.saveDraftConfig(record);
    setIsSaving(false);

    if (res.success) {
      showToast('Design draft saved to Supabase database.');
    } else {
      showToast(res.error || 'Failed to save draft.');
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    const record: DesignConfigurationRecord = {
      name: `Published Design v${versionNumber + 1}`,
      status: 'published',
      versionNumber,
      configJson: config,
    };

    const res = await designConfigService.publishDesignConfig(record);
    setIsSaving(false);

    if (res.success && res.data) {
      setVersionNumber(res.data.versionNumber);
      setPreviewConfig(null);
      await refreshDesignConfig();
      showToast(`Design Version ${res.data.versionNumber} Published to Production!`);
    } else {
      showToast(res.error || 'Failed to publish design configuration.');
    }
  };

  const handleResetDefaults = () => {
    setConfig(DEFAULT_DESIGN_SYSTEM_CONFIG);
    setPreviewConfig(null);
    showToast('Reset draft configuration to system defaults.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-sm border border-slate-700 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-main)] flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#0F4C81] dark:text-[#38BDF8]" />
            Centralized Admin Design & UI Studio
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Configure color tokens, typography scales, timer badges, and exam UI layouts. Changes are isolated until published.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-2 border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-main)] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
          <button
            onClick={() => handleTogglePreview(true)}
            className="px-3 py-2 border border-[#0F4C81] text-[#0F4C81] dark:text-[#38BDF8] hover:bg-[#0F4C81]/10 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" /> Live Preview
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-4 py-2 border border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={isSaving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Publish Version {versionNumber + 1}
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl">
        {[
          { id: 'colors', label: 'Color Tokens', icon: Palette },
          { id: 'typography', label: 'Typography Scale', icon: Type },
          { id: 'exam_ui', label: 'Exam Simulator UI', icon: Layout },
          { id: 'branding', label: 'Branding & Header', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#0F4C81] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-6">

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-5">
              <h3 className="font-extrabold text-sm text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#0F4C81]" /> Platform Color Tokens
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'primary', label: 'Primary (Banking Blue)', desc: 'Headers & Primary Buttons' },
                  { key: 'secondary', label: 'Secondary Highlight', desc: 'Badges & Accents' },
                  { key: 'background', label: 'Canvas Background', desc: 'Main Page Canvas' },
                  { key: 'surface', label: 'Surface & Cards', desc: 'Card Backgrounds' },
                  { key: 'textMain', label: 'Main Text', desc: 'High Contrast Question Prompt' },
                  { key: 'textMuted', label: 'Muted Text', desc: 'Subtitles & Labels' },
                  { key: 'borderColor', label: 'Border Color', desc: 'Card Borders' },
                  { key: 'success', label: 'Success (Answered)', desc: 'Correct Answers & Palette' },
                  { key: 'warning', label: 'Warning (Review)', desc: 'Marked for Review' },
                  { key: 'error', label: 'Error (Not Answered)', desc: 'Wrong Choices & Unanswered' },
                ].map((item) => (
                  <div key={item.key} className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] flex items-center justify-between gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-main)]">{item.label}</label>
                      <span className="text-[10px] text-[var(--text-muted)] block">{item.desc}</span>
                    </div>
                    <input
                      type="color"
                      value={(config.colors as any)[item.key] || '#0F4C81'}
                      onChange={(e) => updateColor(item.key as any, e.target.value)}
                      className="w-9 h-9 rounded-lg border border-[var(--border-color)] cursor-pointer shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === 'typography' && (
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-5">
              <h3 className="font-extrabold text-sm text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
                <Type className="w-4 h-4 text-[#0F4C81]" /> Typography & Readability Scale
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Font Family</label>
                  <select
                    value={config.typography.fontFamily}
                    onChange={(e) => setConfig((prev) => ({ ...prev, typography: { ...prev.typography, fontFamily: e.target.value as any } }))}
                    className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-sm font-semibold text-[var(--text-main)]"
                  >
                    <option value="Inter">Inter (Recommended Banking Font)</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Roboto">Roboto</option>
                    <option value="System">System Sans-Serif</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Question Font Size</label>
                    <select
                      value={config.typography.questionFontSize}
                      onChange={(e) => setConfig((prev) => ({ ...prev, typography: { ...prev.typography, questionFontSize: e.target.value as any } }))}
                      className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-sm font-semibold text-[var(--text-main)]"
                    >
                      <option value="16px">16px (Compact)</option>
                      <option value="18px">18px (Standard Readable)</option>
                      <option value="20px">20px (Large High Visibility)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Option Choice Font Size</label>
                    <select
                      value={config.typography.optionFontSize}
                      onChange={(e) => setConfig((prev) => ({ ...prev, typography: { ...prev.typography, optionFontSize: e.target.value as any } }))}
                      className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-sm font-semibold text-[var(--text-main)]"
                    >
                      <option value="14px">14px</option>
                      <option value="15px">15px</option>
                      <option value="16px">16px</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Exam Simulator UI Tab */}
          {activeTab === 'exam_ui' && (
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-5">
              <h3 className="font-extrabold text-sm text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
                <Layout className="w-4 h-4 text-[#0F4C81]" /> Exam Simulator & Timer Presentation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Question Palette Position</label>
                  <select
                    value={config.questionPalette.position}
                    onChange={(e) => setConfig((prev) => ({ ...prev, questionPalette: { ...prev.questionPalette, position: e.target.value as any } }))}
                    className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-sm font-semibold text-[var(--text-main)]"
                  >
                    <option value="right_sidebar">Right Sidebar (NTA Standard)</option>
                    <option value="bottom_drawer">Bottom Slide Drawer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Answer Choice Layout</label>
                  <select
                    value={config.answerOptions.layout}
                    onChange={(e) => setConfig((prev) => ({ ...prev, answerOptions: { ...prev.answerOptions, layout: e.target.value as any } }))}
                    className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-sm font-semibold text-[var(--text-main)]"
                  >
                    <option value="vertical">Vertical Full Width Cards</option>
                    <option value="compact_grid">Compact 2-Column Grid</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-5">
              <h3 className="font-extrabold text-sm text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0F4C81]" /> Platform Branding
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Platform Name</label>
                  <input
                    type="text"
                    value={config.branding.platformName}
                    onChange={(e) => setConfig((prev) => ({ ...prev, branding: { ...prev.branding, platformName: e.target.value } }))}
                    className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-sm font-semibold text-[var(--text-main)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Sub-Tagline</label>
                  <input
                    type="text"
                    value={config.branding.tagline}
                    onChange={(e) => setConfig((prev) => ({ ...prev, branding: { ...prev.branding, tagline: e.target.value } }))}
                    className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-sm font-semibold text-[var(--text-main)]"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Live Token Sandbox Preview Box */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
            <h3 className="font-extrabold text-sm text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" /> Token Sandbox Preview
            </h3>

            {/* Mock Exam Question Card */}
            <div
              className="p-5 rounded-2xl border space-y-3 shadow-xs"
              style={{
                backgroundColor: config.colors.surface,
                borderColor: config.colors.borderColor,
                color: config.colors.textMain,
                fontFamily: config.typography.fontFamily,
              }}
            >
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="px-2 py-0.5 rounded text-white font-extrabold" style={{ backgroundColor: config.colors.primary }}>
                  Quantitative Aptitude
                </span>
                <span style={{ color: config.colors.textMuted }}>Q1 of 35</span>
              </div>

              <div style={{ fontSize: config.typography.questionFontSize, fontWeight: 700, lineHeight: 1.5 }}>
                What is the simple interest on ₹12,000 at 8% per annum for 3 years?
              </div>

              <div className="space-y-2 pt-1">
                {['₹2,880', '₹3,000', '₹2,640', '₹3,200'].map((optText, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold"
                    style={{
                      backgroundColor: idx === 0 ? config.colors.background : config.colors.surface,
                      borderColor: idx === 0 ? config.colors.primary : config.colors.borderColor,
                      color: idx === 0 ? config.colors.primary : config.colors.textMain,
                      fontSize: config.typography.optionFontSize,
                    }}
                  >
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px]"
                      style={{
                        backgroundColor: idx === 0 ? config.colors.primary : config.colors.background,
                        color: idx === 0 ? '#FFFFFF' : config.colors.textMain,
                      }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{optText}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-[var(--text-muted)] space-y-1">
              <div><strong>Status:</strong> Draft configuration</div>
              <div><strong>Published Version:</strong> v{versionNumber}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
