import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Save,
  Send,
  Copy,
  AlertOctagon,
  CheckCircle2,
  Layers,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  Loader2,
  Archive,
  Eye
} from 'lucide-react';
import { ExamCategory } from '../../types';
import { adminExamBuilderService, ExamBuilderConfig, SectionRuleConfig } from '../../services/adminExamBuilderService';
import { initialQuestions } from '../../data/mockData';

export const AdminExamBuilder: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentExamId, setCurrentExamId] = useState<string | undefined>(examId);

  const [title, setTitle] = useState('SBI Clerk Prelims Live Mock 2024');
  const [examCategory, setExamCategory] = useState<ExamCategory>('SBI Clerk');
  const [phase, setPhase] = useState<'prelims' | 'mains'>('prelims');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [status, setStatus] = useState<'draft' | 'validating' | 'ready' | 'published' | 'archived'>('draft');
  const [versionNumber, setVersionNumber] = useState(1);
  const [enableOptionRandomization, setEnableOptionRandomization] = useState(true);
  const [instructions, setInstructions] = useState('Read questions carefully. Each question carries 1 mark with 0.25 negative marking.');

  const [sections, setSections] = useState<SectionRuleConfig[]>([
    {
      sectionId: 'sec-quant',
      sectionName: 'Quantitative Aptitude',
      requiredQuestionCount: 35,
      marksPerQuestion: 1,
      negativeMarks: 0.25,
      durationMinutes: 20,
    },
    {
      sectionId: 'sec-reason',
      sectionName: 'Reasoning Ability',
      requiredQuestionCount: 35,
      marksPerQuestion: 1,
      negativeMarks: 0.25,
      durationMinutes: 20,
    },
    {
      sectionId: 'sec-eng',
      sectionName: 'English Language',
      requiredQuestionCount: 30,
      marksPerQuestion: 1,
      negativeMarks: 0.25,
      durationMinutes: 20,
    },
  ]);

  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (examId) {
      setIsLoading(true);
      adminExamBuilderService.getExamById(examId).then((existing) => {
        if (existing) {
          setCurrentExamId(existing.id);
          setTitle(existing.title);
          setExamCategory(existing.exam);
          setPhase(existing.phase);
          setDurationMinutes(existing.durationMinutes);
          setStatus(existing.status);
          setVersionNumber(existing.versionNumber);
          setEnableOptionRandomization(existing.enableOptionRandomization);
          setInstructions(existing.instructions);
          if (existing.sections?.length > 0) setSections(existing.sections);
        }
        setIsLoading(false);
      });
    }
  }, [examId]);

  const totalQuestionsCalculated = sections.reduce((acc, s) => acc + s.requiredQuestionCount, 0);
  const totalMarksCalculated = sections.reduce((acc, s) => acc + s.requiredQuestionCount * s.marksPerQuestion, 0);

  const currentConfig: ExamBuilderConfig = {
    id: currentExamId,
    title,
    exam: examCategory,
    phase,
    durationMinutes,
    totalQuestions: totalQuestionsCalculated,
    totalMarks: totalMarksCalculated,
    status,
    versionNumber,
    enableOptionRandomization,
    instructions,
    sections,
  };

  const handleValidatePool = async () => {
    const res = await adminExamBuilderService.validatePoolAvailability(currentConfig, initialQuestions);
    setValidationResult(res);
    if (res.isValid) {
      showToast('Pool Validation Passed! All required section questions are available.');
    } else {
      showToast('Validation Blocked: Insufficient questions in pool.');
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    const res = await adminExamBuilderService.saveDraftExam(currentConfig);
    setIsSaving(false);

    if (res.success && res.data) {
      setCurrentExamId(res.data.id);
      showToast(`Exam '${title}' saved successfully to database.`);
    } else {
      showToast(res.error || 'Failed to save exam draft.');
    }
  };

  const handlePublishExam = async () => {
    setIsSaving(true);
    const res = await adminExamBuilderService.publishExamVersion(currentConfig, initialQuestions);
    setIsSaving(false);

    if (res.success && res.publishedConfig) {
      setCurrentExamId(res.publishedConfig.id);
      setStatus('published');
      showToast(`Exam Version ${res.publishedConfig.versionNumber} Published Successfully!`);
    } else {
      setValidationResult({
        isValid: false,
        blockers: res.blockers || ['Publishing blocked due to pool shortage or permission error.'],
        warnings: [],
        sectionAvailability: {},
      });
      showToast('Cannot publish due to validation blockers.');
    }
  };

  const handleArchiveExam = async () => {
    if (!currentExamId) return;
    setIsSaving(true);
    const res = await adminExamBuilderService.archiveExam(currentExamId);
    setIsSaving(false);

    if (res.success) {
      setStatus('archived');
      showToast(`Exam '${title}' archived safely without removing historical student attempts.`);
    } else {
      showToast(res.error || 'Failed to archive exam.');
    }
  };

  const handleDuplicateDraft = () => {
    const duplicate = adminExamBuilderService.duplicateExamAsDraft(currentConfig);
    setCurrentExamId(undefined);
    setTitle(duplicate.title);
    setStatus('draft');
    setVersionNumber(duplicate.versionNumber);
    showToast('Duplicated as new independent draft version.');
  };

  const handleUpdateSection = (index: number, updated: Partial<SectionRuleConfig>) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...updated } : s))
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F4C81]" />
        <span className="text-sm font-semibold text-[var(--text-muted)]">Loading Exam Configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-sm border border-slate-700 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation & Header */}
      <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-xs font-bold text-[#0F4C81] dark:text-[#38BDF8] hover:underline flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-extrabold text-[var(--text-main)] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#0F4C81] dark:text-[#38BDF8]" />
            {currentExamId ? 'Edit Exam & Mock Test Configuration' : 'Create New Exam & Mock Test'}
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Design exam templates, section rules, pool distributions, and publish immutable exam versions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {currentExamId && (
            <>
              <button
                onClick={() => navigate(`/mock-test/${currentExamId}`)}
                className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button
                onClick={handleDuplicateDraft}
                className="px-3 py-2 border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-main)] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Duplicate Draft
              </button>
              <button
                onClick={handleArchiveExam}
                className="px-3 py-2 border border-rose-200 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Archive className="w-3.5 h-3.5" /> Archive
              </button>
            </>
          )}
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-4 py-2 border border-[#0F4C81] text-[#0F4C81] dark:text-[#38BDF8] hover:bg-[#0F4C81]/10 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Draft
          </button>
          <button
            onClick={handlePublishExam}
            disabled={isSaving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Publish Version {versionNumber}
          </button>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Form: Exam Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-[var(--text-main)] uppercase tracking-wider">General Exam Settings</h3>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                status === 'published'
                  ? 'bg-emerald-100 text-emerald-800'
                  : status === 'archived'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {status}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Exam Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-sm font-semibold text-[var(--text-main)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Target Exam</label>
                <select
                  value={examCategory}
                  onChange={(e) => setExamCategory(e.target.value as ExamCategory)}
                  className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-sm font-semibold text-[var(--text-main)]"
                >
                  <option value="SBI Clerk">SBI Clerk 2024</option>
                  <option value="IBPS Clerk">IBPS Clerk 2024</option>
                  <option value="RBI Assistant">RBI Assistant 2024</option>
                  <option value="RRB Clerk">RRB Office Assistant 2024</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Phase</label>
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value as any)}
                  className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-sm font-semibold text-[var(--text-main)]"
                >
                  <option value="prelims">Prelims</option>
                  <option value="mains">Mains</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Total Duration (Mins)</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-sm font-semibold text-[var(--text-main)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Instructions</label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-xs font-medium text-[var(--text-main)]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="optRandom"
                checked={enableOptionRandomization}
                onChange={(e) => setEnableOptionRandomization(e.target.checked)}
                className="rounded border-[var(--border-color)] text-[#0F4C81] focus:ring-[#0F4C81]"
              />
              <label htmlFor="optRandom" className="text-xs font-bold text-[var(--text-main)]">
                Enable Answer Option Randomization per Attempt
              </label>
            </div>
          </div>

          {/* Section Configuration Table */}
          <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0F4C81]" /> Sectional Rules & Marking Schema
              </h3>
              <button
                onClick={handleValidatePool}
                className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Validate Pool
              </button>
            </div>

            <div className="space-y-3">
              {sections.map((sec, idx) => (
                <div key={sec.sectionId} className="p-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl space-y-3">
                  <div className="flex justify-between items-center font-extrabold text-sm text-[var(--text-main)]">
                    <span>{sec.sectionName}</span>
                    <span className="text-xs text-[var(--text-muted)] font-mono">{sec.requiredQuestionCount} Questions</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase">Required Qs</label>
                      <input
                        type="number"
                        value={sec.requiredQuestionCount}
                        onChange={(e) => handleUpdateSection(idx, { requiredQuestionCount: Number(e.target.value) })}
                        className="w-full p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-xs font-bold text-[var(--text-main)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase">Marks / Correct</label>
                      <input
                        type="number"
                        step="0.25"
                        value={sec.marksPerQuestion}
                        onChange={(e) => handleUpdateSection(idx, { marksPerQuestion: Number(e.target.value) })}
                        className="w-full p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-xs font-bold text-[var(--text-main)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase">Negative / Wrong</label>
                      <input
                        type="number"
                        step="0.05"
                        value={sec.negativeMarks}
                        onChange={(e) => handleUpdateSection(idx, { negativeMarks: Number(e.target.value) })}
                        className="w-full p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-xs font-bold text-[var(--text-main)]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Validation Results & Pool Audit */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
            <h3 className="font-extrabold text-sm text-[var(--text-main)] uppercase tracking-wider">Exam Summary</h3>

            <div className="space-y-2 text-xs font-semibold text-[var(--text-muted)]">
              <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
                <span>Calculated Total Questions:</span>
                <span className="font-extrabold text-[var(--text-main)]">{totalQuestionsCalculated} Qs</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
                <span>Calculated Maximum Marks:</span>
                <span className="font-extrabold text-[var(--text-main)]">{totalMarksCalculated} Marks</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]">
                <span>Configured Duration:</span>
                <span className="font-extrabold text-[var(--text-main)]">{durationMinutes} Minutes</span>
              </div>
            </div>

            {/* Pool Availability Feedback */}
            {validationResult && (
              <div className="pt-2 space-y-3">
                <div className="text-xs font-extrabold uppercase text-[var(--text-muted)]">Pool Validation Status</div>
                {validationResult.isValid ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Eligible Question Pool Confirmed. Ready to Publish.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {validationResult.blockers.map((b: string, i: number) => (
                      <div key={i} className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-xl text-xs text-rose-800 dark:text-rose-300 font-bold flex items-start gap-2">
                        <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
