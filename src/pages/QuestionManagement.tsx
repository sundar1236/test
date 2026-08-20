import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Question, ExamCategory, SubjectSection, DifficultyLevel } from '../types';
import { Search, Plus, Check, X, Edit3, FileSpreadsheet, ChevronLeft, ChevronRight, CheckSquare, Square, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { bulkActionService } from '../services/bulkActionService';

export const QuestionManagement: React.FC = () => {
  const { questions, addQuestion, updateQuestionStatus } = useApp();

  const [search, setSearch] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [newQuestionText, setNewQuestionText] = useState('');
  const [newExam, setNewExam] = useState<ExamCategory>('SBI Clerk');
  const [newSection, setNewSection] = useState<SubjectSection>('Quantitative Aptitude');
  const [newTopic, setNewTopic] = useState('Profit & Loss');
  const [newDifficulty, setNewDifficulty] = useState<DifficultyLevel>('Moderate');
  const [newStatus, setNewStatus] = useState<any>('draft');
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
      const matchesDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;

      const qStatus = q.status || 'approved';
      const matchesStatus = selectedStatus === 'All' || qStatus === selectedStatus;

      return matchesSearch && matchesExam && matchesSection && matchesDifficulty && matchesStatus;
    });
  }, [questions, search, selectedExam, selectedSection, selectedDifficulty, selectedStatus]);

  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage, pageSize]);

  const toggleSelectAll = () => {
    if (selectedQuestionIds.length === paginatedQuestions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(paginatedQuestions.map(q => q.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const handleBulkPublish = async () => {
    if (selectedQuestionIds.length === 0) return;
    await bulkActionService.bulkPublish(selectedQuestionIds);
    selectedQuestionIds.forEach(id => updateQuestionStatus(id, 'approved'));
    alert(`Successfully published ${selectedQuestionIds.length} questions!`);
    setSelectedQuestionIds([]);
  };

  const handleBulkArchive = async () => {
    if (selectedQuestionIds.length === 0) return;
    await bulkActionService.bulkArchive(selectedQuestionIds);
    selectedQuestionIds.forEach(id => updateQuestionStatus(id, 'rejected'));
    alert(`Archived ${selectedQuestionIds.length} questions.`);
    setSelectedQuestionIds([]);
  };

  const handleStartEdit = (q: Question) => {
    setEditingQuestion(q);
    setNewQuestionText(q.questionText);
    setNewExam(q.exam);
    setNewSection(q.section);
    setNewTopic(q.topic);
    setNewDifficulty(q.difficulty);
    setNewStatus(q.status || 'approved');
    setOptA(q.options[0]?.text || '');
    setOptB(q.options[1]?.text || '');
    setOptC(q.options[2]?.text || '');
    setOptD(q.options[3]?.text || '');
    setOptE(q.options[4]?.text || '');
    setCorrectOption(q.correctOptionId || 'A');
    setExplanation(q.explanation || '');
    setIsAddModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText || !optA || !optB) return;

    const formattedQuestion: Question = {
      id: editingQuestion ? editingQuestion.id : `q-custom-${Date.now()}`,
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
      status: newStatus,
      aiConfidence: 98,
    };

    if (editingQuestion) {
      updateQuestionStatus(editingQuestion.id, newStatus);
    } else {
      addQuestion(formattedQuestion);
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingQuestion(null);
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
      <div className="bg-white p-6 rounded-2xl border border-[var(--border-color)] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Question Bank Repository</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Search, filter, paginate, bulk-update, and publish across 10,000+ SBI, IBPS, RBI, and RRB questions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/import/csv"
            className="px-3.5 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-banking-blue hover:bg-blue-100 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" /> CSV Ingestion
          </Link>
          <Link
            to="/admin/import"
            className="px-3.5 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Layers className="w-4 h-4" /> Import Center
          </Link>
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>

      {selectedQuestionIds.length > 0 && (
        <div className="p-4 bg-banking-blue text-white rounded-2xl flex justify-between items-center shadow-md animate-fade-in">
          <div className="text-xs font-semibold flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-300" />
            <span>{selectedQuestionIds.length} question(s) selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkPublish}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold transition-colors"
            >
              Bulk Publish
            </button>
            <button
              onClick={handleBulkArchive}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 rounded-lg text-xs font-bold transition-colors"
            >
              Bulk Archive
            </button>
            <button
              onClick={() => setSelectedQuestionIds([])}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search questions by formulation, keyword, or topic..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs text-[var(--text-main)] outline-none focus:border-[#0F4C81]"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Exam</label>
            <select
              value={selectedExam}
              onChange={(e) => { setSelectedExam(e.target.value); setCurrentPage(1); }}
              className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none"
            >
              <option value="All">All Exams</option>
              <option value="IBPS Clerk">IBPS Clerk</option>
              <option value="SBI Clerk">SBI Clerk</option>
              <option value="RBI Assistant">RBI Assistant</option>
              <option value="RRB Clerk">RRB Clerk</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => { setSelectedSection(e.target.value); setCurrentPage(1); }}
              className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none"
            >
              <option value="All">All Sections</option>
              <option value="Quantitative Aptitude">Quantitative Aptitude</option>
              <option value="Reasoning Ability">Reasoning Ability</option>
              <option value="English Language">English Language</option>
              <option value="General & Banking Awareness">General Awareness</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Under Review</option>
              <option value="validated">Validated</option>
              <option value="approved">Published</option>
              <option value="rejected">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => { setSelectedDifficulty(e.target.value); setCurrentPage(1); }}
              className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Moderate">Moderate</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs overflow-hidden">
        <div className="flex items-center justify-between mb-4 text-xs text-[var(--text-muted)]">
          <span>Showing {paginatedQuestions.length} of {filteredQuestions.length} records</span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                <th className="py-3 px-3 w-10 text-center">
                  <button onClick={toggleSelectAll} className="p-1 text-slate-500 hover:text-slate-800">
                    {selectedQuestionIds.length === paginatedQuestions.length && paginatedQuestions.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-banking-blue" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">Question Formulation</th>
                <th className="py-3 px-3">Exam</th>
                <th className="py-3 px-3">Section & Topic</th>
                <th className="py-3 px-3">Difficulty</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] font-medium text-[var(--text-main)]">
              {paginatedQuestions.map((q) => {
                const isSelected = selectedQuestionIds.includes(q.id);
                const statusBadge = q.status || 'approved';
                return (
                  <tr key={q.id} className={`hover:bg-[var(--bg-main)] transition-colors ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                    <td className="py-3.5 px-3 text-center">
                      <button onClick={() => toggleSelectOne(q.id)} className="p-1">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-banking-blue" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-3 max-w-md font-semibold text-slate-900 dark:text-slate-100">
                      <div className="line-clamp-2">{q.questionText}</div>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-[#0F4C81] dark:text-[#38BDF8]">{q.exam}</td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold">{q.section}</div>
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
                      <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${
                        statusBadge === 'approved' || statusBadge === 'published' ? 'bg-emerald-500/10 text-emerald-600' :
                        statusBadge === 'pending' || statusBadge === 'under_review' ? 'bg-amber-500/10 text-amber-600' :
                        statusBadge === 'validated' ? 'bg-purple-500/10 text-purple-600' :
                        statusBadge === 'draft' ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200' :
                        'bg-rose-500/10 text-rose-600'
                      }`}>
                        {statusBadge}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStartEdit(q)}
                          className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]"
                          title="Edit Question"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {(statusBadge === 'pending' || statusBadge === 'under_review' || statusBadge === 'draft') && (
                          <button
                            onClick={() => updateQuestionStatus(q.id, 'approved')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                            title="Approve & Publish"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-4 mt-4 border-t border-[var(--border-color)] flex items-center justify-between">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-bold disabled:opacity-40 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Page
          </button>
          <span className="text-xs font-semibold text-[var(--text-muted)]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-bold disabled:opacity-40 flex items-center gap-1"
          >
            Next Page <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="font-bold text-base text-[var(--text-main)]">
                {editingQuestion ? 'Edit Question Record' : 'Create New Question Record'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
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
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Lifecycle Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-bold text-emerald-600"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Under Review</option>
                    <option value="validated">Validated</option>
                    <option value="approved">Published</option>
                    <option value="rejected">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Question Statement</label>
                <textarea
                  rows={3}
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Enter problem statement..."
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
                    placeholder="Solution explanation..."
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
    </div>
  );
};
