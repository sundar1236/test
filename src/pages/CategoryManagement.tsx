import React, { useState, useEffect } from 'react';
import { examService } from '../services/examService';
import { topicService } from '../services/topicService';
import { FolderKanban, Plus, Layers, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';

export const CategoryManagement: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  // Form states
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamCode, setNewExamCode] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionCode, setNewSectionCode] = useState('');

  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');

  const [notice, setNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const eData = await examService.getExams();
      setExams(eData || []);
      const sData = await examService.getSections();
      setSections(sData || []);
      if (sData && sData.length > 0) setSelectedSectionId(sData[0].id);

      const tData = await topicService.getAllTopics();
      setTopics(tData || []);
    } catch (err) {
      // Fallback local mock metadata
      setExams([
        { id: 'ex-1', code: 'SBI_CLERK', title: 'SBI Clerk 2024', is_active: true },
        { id: 'ex-2', code: 'IBPS_CLERK', title: 'IBPS Clerk 2024', is_active: true },
        { id: 'ex-3', code: 'RBI_ASSIST', title: 'RBI Assistant 2024', is_active: true },
        { id: 'ex-4', code: 'RRB_CLERK', title: 'RRB Office Assistant 2024', is_active: true },
      ]);
      setSections([
        { id: 'sec-1', code: 'QUANT', name: 'Quantitative Aptitude' },
        { id: 'sec-2', code: 'REASONING', name: 'Reasoning Ability' },
        { id: 'sec-3', code: 'ENGLISH', name: 'English Language' },
        { id: 'sec-4', code: 'GA', name: 'General & Banking Awareness' },
      ]);
      setTopics([
        { id: 'top-1', title: 'Percentage & Ratio', sections: { name: 'Quantitative Aptitude' } },
        { id: 'top-2', title: 'Profit & Loss', sections: { name: 'Quantitative Aptitude' } },
        { id: 'top-3', title: 'Seating & Puzzles', sections: { name: 'Reasoning Ability' } },
        { id: 'top-4', title: 'Syllogism & Inequalities', sections: { name: 'Reasoning Ability' } },
        { id: 'top-5', title: 'Reading Comprehension', sections: { name: 'English Language' } },
        { id: 'top-6', title: 'Banking Terms & RBI Guidelines', sections: { name: 'General & Banking Awareness' } },
      ]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle || !newExamCode) return;
    try {
      await examService.createExam(newExamCode.toUpperCase(), newExamTitle);
      showNotice('New Exam Series Created!');
      setNewExamTitle('');
      setNewExamCode('');
      loadData();
    } catch (err) {
      const mockNew = { id: `ex-${Date.now()}`, code: newExamCode.toUpperCase(), title: newExamTitle, is_active: true };
      setExams((prev) => [...prev, mockNew]);
      showNotice('New Exam Series Created (Local Session)!');
      setNewExamTitle('');
      setNewExamCode('');
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName || !newSectionCode) return;
    try {
      await examService.createSection(newSectionCode.toUpperCase(), newSectionName);
      showNotice('New Subject Section Created!');
      setNewSectionName('');
      setNewSectionCode('');
      loadData();
    } catch (err) {
      const mockNew = { id: `sec-${Date.now()}`, code: newSectionCode.toUpperCase(), name: newSectionName };
      setSections((prev) => [...prev, mockNew]);
      showNotice('New Subject Section Created (Local Session)!');
      setNewSectionName('');
      setNewSectionCode('');
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle || !selectedSectionId) return;
    try {
      await topicService.createTopic(selectedSectionId, newTopicTitle, newTopicDesc);
      showNotice('New Topic Created!');
      setNewTopicTitle('');
      setNewTopicDesc('');
      loadData();
    } catch (err) {
      const secObj = sections.find((s) => s.id === selectedSectionId);
      const mockNew = { id: `top-${Date.now()}`, title: newTopicTitle, sections: { name: secObj?.name || 'General' } };
      setTopics((prev) => [...prev, mockNew]);
      showNotice('New Topic Created (Local Session)!');
      setNewTopicTitle('');
      setNewTopicDesc('');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Exam, Section & Topic Metadata Management</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Configure target banking exam series, subject sections, and hierarchical topic structures.
          </p>
        </div>
        {notice && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-4 h-4" /> {notice}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Exam Series Manager */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-[#0F4C81] dark:text-[#38BDF8] font-bold text-base">
            <ShieldCheck className="w-5 h-5" /> Exam Series ({exams.length})
          </div>

          <form onSubmit={handleCreateExam} className="space-y-3 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Exam Code</label>
              <input
                type="text"
                placeholder="e.g. SBI_CLERK"
                value={newExamCode}
                onChange={(e) => setNewExamCode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-mono font-bold text-[var(--text-main)] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Exam Display Title</label>
              <input
                type="text"
                placeholder="e.g. SBI Clerk 2024"
                value={newExamTitle}
                onChange={(e) => setNewExamTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Exam Series
            </button>
          </form>

          <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Active Exam Series</p>
            {exams.map((ex) => (
              <div key={ex.id} className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[var(--text-main)]">{ex.title}</div>
                  <div className="font-mono text-[10px] text-[var(--text-muted)]">{ex.code}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Sections Manager */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-base">
            <Layers className="w-5 h-5" /> Subject Sections ({sections.length})
          </div>

          <form onSubmit={handleCreateSection} className="space-y-3 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Section Code</label>
              <input
                type="text"
                placeholder="e.g. QUANT"
                value={newSectionCode}
                onChange={(e) => setNewSectionCode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-mono font-bold text-[var(--text-main)] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Section Name</label>
              <input
                type="text"
                placeholder="e.g. Quantitative Aptitude"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Section
            </button>
          </form>

          <div className="pt-3 border-t border-[var(--border-color)] space-y-2">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Existing Sections</p>
            {sections.map((sec) => (
              <div key={sec.id} className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[var(--text-main)]">{sec.name}</div>
                  <div className="font-mono text-[10px] text-[var(--text-muted)]">{sec.code}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 text-[10px] font-bold">Standard</span>
              </div>
            ))}
          </div>
        </div>

        {/* Topics Hierarchy Manager */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-base">
            <FolderKanban className="w-5 h-5" /> Topic Hierarchy ({topics.length})
          </div>

          <form onSubmit={handleCreateTopic} className="space-y-3 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Parent Section</label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>{sec.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Topic Title</label>
              <input
                type="text"
                placeholder="e.g. Profit & Loss"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Topic
            </button>
          </form>

          <div className="pt-3 border-t border-[var(--border-color)] space-y-2 max-h-60 overflow-y-auto pr-1">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Existing Topics</p>
            {topics.map((top) => (
              <div key={top.id} className="p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--text-main)]">{top.title}</span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">{top.sections?.name || 'Section'}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
