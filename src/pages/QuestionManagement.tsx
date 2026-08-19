import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Question, ExamCategory, SubjectSection, DifficultyLevel } from '../types';
import { Search, Plus, Upload, Check, X, Trash2, Edit3, FileSpreadsheet, Sparkles, Filter } from 'lucide-react';

export const QuestionManagement: React.FC = () => {
  const { questions, addQuestion, updateQuestionStatus } = useApp();

  const [search, setSearch] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form State for New Question
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newExam, setNewExam] = useState<ExamCategory>('SBI Clerk');
  const [newSection, setNewSection] = useState<SubjectSection>('Quantitative Aptitude');
  const [newTopic, setNewTopic] = useState('Profit & Loss');
  const [newDifficulty, setNewDifficulty] = useState<DifficultyLevel>('Moderate');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [optE, setOptE] = useState('');
  const [correctOption, setCorrectOption] = useState('A');
  const [explanation, setExplanation] = useState('');

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        q.questionText.toLowerCase().includes(search.toLowerCase()) ||
        q.topic.toLowerCase().includes(search.toLowerCase());
      const matchesExam = selectedExam === 'All' || q.exam === selectedExam;
      const matchesSection = selectedSection === 'All' || q.section === selectedSection;

      return matchesSearch && matchesExam && matchesSection;
    });
  }, [questions, search, selectedExam, selectedSection]);

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText || !optA || !optB) return;

    const newQ: Question = {
      id: `q-custom-${Date.now()}`,
      exam: newExam,
      section: newSection,
      topic: newTopic,
      difficulty: newDifficulty,
      year: 2024,
      questionText: newQuestionText,
      options: [
        { id: 'A', text: optA },
        { id: 'B', text: optB },
        { id: 'C', text: optC || 'None of these' },
        { id: 'D', text: optD || 'Cannot be determined' },
        { id: 'E', text: optE || 'Both A & B' },
      ],
      correctOptionId: correctOption,
      explanation: explanation || 'Standard bank exam solution methodology applies.',
      status: 'approved',
      aiConfidence: 98,
    };

    addQuestion(newQ);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewQuestionText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setOptE('');
    setExplanation('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Question Bank Management</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Create, audit, and import test questions across all banking categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-card)] font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4 text-[#0F4C81] dark:text-[#38BDF8]" /> Bulk Import (CSV/Excel)
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Single Question
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by keyword or topic..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs text-[var(--text-main)] outline-none focus:border-[#0F4C81]"
          />
        </div>

        <select
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
          className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none"
        >
          <option value="All">All Exams</option>
          <option value="IBPS Clerk">IBPS Clerk</option>
          <option value="SBI Clerk">SBI Clerk</option>
          <option value="RBI Assistant">RBI Assistant</option>
          <option value="RRB Clerk">RRB Clerk</option>
        </select>

        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none"
        >
          <option value="All">All Sections</option>
          <option value="Quantitative Aptitude">Quantitative Aptitude</option>
          <option value="Reasoning Ability">Reasoning Ability</option>
          <option value="English Language">English Language</option>
          <option value="General & Banking Awareness">General & Banking Awareness</option>
        </select>
      </div>

      {/* Table View */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                <th className="py-3 px-3">Question Text</th>
                <th className="py-3 px-3">Exam</th>
                <th className="py-3 px-3">Section & Topic</th>
                <th className="py-3 px-3">Difficulty</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] font-medium text-[var(--text-main)]">
              {filteredQuestions.map((q) => (
                <tr key={q.id} className="hover:bg-[var(--bg-main)]">
                  <td className="py-3.5 px-3 max-w-sm truncate font-semibold">{q.questionText}</td>
                  <td className="py-3.5 px-3 font-bold text-[#0F4C81] dark:text-[#38BDF8]">{q.exam}</td>
                  <td className="py-3.5 px-3">
                    <div>{q.section}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono">{q.topic}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-600' :
                      q.difficulty === 'Moderate' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-rose-500/10 text-rose-600'
                    }`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      q.status === 'approved' || !q.status ? 'bg-emerald-500/10 text-emerald-600' :
                      q.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-rose-500/10 text-rose-600'
                    }`}>
                      {q.status || 'Approved'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {q.status === 'pending' && (
                        <button
                          onClick={() => updateQuestionStatus(q.id, 'approved')}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                          title="Approve Question"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Question Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="font-bold text-base text-[var(--text-main)]">Add Single Question</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Exam</label>
                  <select
                    value={newExam}
                    onChange={(e) => setNewExam(e.target.value as ExamCategory)}
                    className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold"
                  >
                    <option value="SBI Clerk">SBI Clerk</option>
                    <option value="IBPS Clerk">IBPS Clerk</option>
                    <option value="RBI Assistant">RBI Assistant</option>
                    <option value="RRB Clerk">RRB Clerk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Section</label>
                  <select
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value as SubjectSection)}
                    className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold"
                  >
                    <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                    <option value="Reasoning Ability">Reasoning Ability</option>
                    <option value="English Language">English Language</option>
                    <option value="General & Banking Awareness">General Awareness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Topic</label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Question Text</label>
                <textarea
                  rows={3}
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Enter complete question formulation here..."
                  className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-medium outline-none focus:border-[#0F4C81]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Option A"
                  value={optA}
                  onChange={(e) => setOptA(e.target.value)}
                  className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-xs"
                  required
                />
                <input
                  type="text"
                  placeholder="Option B"
                  value={optB}
                  onChange={(e) => setOptB(e.target.value)}
                  className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-xs"
                  required
                />
                <input
                  type="text"
                  placeholder="Option C"
                  value={optC}
                  onChange={(e) => setOptC(e.target.value)}
                  className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-xs"
                />
                <input
                  type="text"
                  placeholder="Option D"
                  value={optD}
                  onChange={(e) => setOptD(e.target.value)}
                  className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Correct Option</label>
                  <select
                    value={correctOption}
                    onChange={(e) => setCorrectOption(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-bold text-emerald-600"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                    <option value="E">Option E</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Explanation</label>
                  <input
                    type="text"
                    placeholder="Short solution text..."
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-color)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F4C81] text-white text-xs font-bold shadow-md"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal Simulator */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 mx-auto flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-base text-[var(--text-main)]">Bulk Import Questions</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Upload .CSV or .XLSX files containing standard columns: <br />
              <code className="text-[10px] bg-slate-100 dark:bg-slate-800 p-1 rounded font-mono">
                exam, section, topic, question_text, opt_a, opt_b, correct_opt, explanation
              </code>
            </p>

            <div className="p-8 border-2 border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-main)] text-xs text-[var(--text-muted)] cursor-pointer hover:border-[#0F4C81]">
              Drag & drop CSV file here, or click to browse
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="w-full py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-bold"
              >
                Close Simulator
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
