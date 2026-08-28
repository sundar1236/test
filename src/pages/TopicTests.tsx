import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService } from '../services/examService';
import { topicService } from '../services/topicService';
import { useApp } from '../context/AppContext';
import { FolderKanban, Play, AlertCircle, Layers, ArrowRight } from 'lucide-react';

export const TopicTests: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useApp();

  const [exams, setExams] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');

  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    async function initMetadata() {
      try {
        const eData = await examService.getExams();
        setExams(eData || []);
        if (eData && eData.length > 0) {
          const matchedTarget = eData.find((ex: any) => ex.id === userProfile.targetExamId || ex.title === userProfile.targetExam);
          setSelectedExamId(matchedTarget ? matchedTarget.id : eData[0].id);
        }

        const sData = await examService.getSections();
        setSections(sData || []);
        if (sData && sData.length > 0) setSelectedSectionId(sData[0].id);

        const tData = await topicService.getAllTopics();
        setTopics(tData || []);
        if (tData && tData.length > 0) setSelectedTopicId(tData[0].id);
      } catch {
        // Fallback metadata handling
      }
    }

    initMetadata();
  }, [userProfile.targetExamId, userProfile.targetExam]);

  const filteredTopics = topics.filter((t) => {
    if (selectedSectionId && t.section_id) {
      return t.section_id === selectedSectionId;
    }
    return true;
  });

  const handleStartTopicTest = () => {
    if (!selectedExamId || !selectedSectionId || !selectedTopicId) {
      setNotice('Please select an Exam, Section, and Topic to start your topic quiz.');
      return;
    }

    // Direct navigation to dedicated Topic Test route
    navigate(`/topic-test/${selectedExamId}/${selectedSectionId}/${selectedTopicId}`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Topic-Wise Practice Tests</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Select target exam, subject section, and specific topic for focused 10-15 minute subject quizzes.
        </p>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Selection Control Panel */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs space-y-6">
        <h2 className="text-base font-extrabold text-[var(--text-main)] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#0F4C81] dark:text-[#38BDF8]" /> Select Exam, Section & Topic
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: Select Exam */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">1. Target Exam</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none focus:border-[#0F4C81]"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.title}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Section */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">2. Subject Section</label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none focus:border-[#0F4C81]"
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>

          {/* Step 3: Select Topic */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">3. Target Topic</label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-main)] outline-none focus:border-[#0F4C81]"
            >
              {filteredTopics.length > 0 ? (
                filteredTopics.map((top) => (
                  <option key={top.id} value={top.id}>{top.title}</option>
                ))
              ) : (
                <option value="">No topics found for section</option>
              )}
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleStartTopicTest}
            disabled={!selectedTopicId}
            className="px-6 py-3 rounded-xl bg-[#0F4C81] hover:bg-[#0B3A64] disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
          >
            Start Topic Test <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Topic Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Available Topic Modules ({filteredTopics.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className={`p-5 rounded-2xl bg-[var(--bg-card)] border transition-all cursor-pointer ${
                selectedTopicId === topic.id
                  ? 'border-[#0F4C81] dark:border-[#38BDF8] ring-2 ring-[#0F4C81]/20 shadow-md'
                  : 'border-[var(--border-color)] hover:border-[#0F4C81]/40'
              }`}
              onClick={() => setSelectedTopicId(topic.id)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-[#0F4C81]/10 text-[#0F4C81] dark:text-[#38BDF8]">
                    {topic.sections?.name || 'Subject'}
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                    Active Quiz
                  </span>
                </div>

                <h4 className="text-base font-bold text-[var(--text-main)]">{topic.title}</h4>
                <p className="text-xs text-[var(--text-muted)] leading-snug">{topic.description || 'Targeted practice set on fundamental concepts.'}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTopicId(topic.id);
                    handleStartTopicTest();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#0F4C81] hover:bg-[#0B3A64] shadow-xs transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Start Quiz
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
