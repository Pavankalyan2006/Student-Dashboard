import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { placementsApi } from '../api/placementsApi';
import { GroupDiscussionTopic } from '../types/placement';
import {
  X,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  CheckSquare,
  Square,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GroupDiscussionHubModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Speaking Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);

  // Self Evaluation Checklist state
  const [checkedCriteria, setCheckedCriteria] = useState<Record<number, boolean>>({});

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['placement-gd-topics'],
    queryFn: () => placementsApi.getGDTopics(),
    enabled: isOpen,
  });

  // Set default selected topic
  useEffect(() => {
    if (topics.length > 0 && !selectedTopicId) {
      setSelectedTopicId(topics[0].id);
    }
  }, [topics, selectedTopicId]);

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  if (!isOpen) return null;

  const filteredTopics = topics.filter((t) => {
    const matchesCat = activeCategory === 'ALL' || t.category === activeCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleStartPhaseTimer = (phaseIndex: number, durationSeconds: number) => {
    setActivePhaseIndex(phaseIndex);
    setTimerSeconds(durationSeconds);
    setIsTimerRunning(true);
  };

  const toggleCheck = (idx: number) => {
    setCheckedCriteria((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Group Discussion (GD) Preparation Hub</h3>
              <p className="text-[11px] text-slate-500">
                Topic library, structured 4-phase discussion frameworks, arguments, and speech timer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Layout: 2 Columns */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Column: Topics Library List */}
          <div className="w-full md:w-80 border-r border-slate-100 bg-slate-50/30 p-4 space-y-4 overflow-y-auto">
            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter GD topics..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap gap-1">
                {['ALL', 'TECH', 'POLICY', 'BUSINESS', 'ETHICS'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      activeCategory === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-2">
              {filteredTopics.map((topic) => {
                const isSelected = selectedTopic?.id === topic.id;
                return (
                  <div
                    key={topic.id}
                    onClick={() => {
                      setSelectedTopicId(topic.id);
                      setCheckedCriteria({});
                      setIsTimerRunning(false);
                      setTimerSeconds(60);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {topic.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                      {topic.title}
                    </h4>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Topic Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {selectedTopic ? (
              <div className="space-y-6">
                {/* Title & Background */}
                <div className="space-y-2 border-b border-slate-100 pb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200">
                    <BookOpen className="h-3.5 w-3.5" />
                    Category: {selectedTopic.category}
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                    {selectedTopic.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedTopic.description}
                  </p>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                    <span className="font-bold text-slate-800">Recruiter Context: </span>
                    {selectedTopic.background_context}
                  </div>
                </div>

                {/* Arguments For & Against */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Arguments FOR */}
                  <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                      <ThumbsUp className="h-4 w-4" />
                      Key Arguments FOR (Pros)
                    </div>
                    <ul className="space-y-2">
                      {selectedTopic.pros_arguments.map((arg, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{arg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Arguments AGAINST */}
                  <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/30 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
                      <ThumbsDown className="h-4 w-4" />
                      Key Arguments AGAINST (Cons)
                    </div>
                    <ul className="space-y-2">
                      {selectedTopic.cons_arguments.map((arg, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <span>{arg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Suggested 4-Stage Discussion Framework with Speech Timer */}
                <div className="p-5 border border-indigo-200 rounded-2xl bg-indigo-50/20 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Structured 4-Phase Framework & Practice Timer</h4>
                      <p className="text-xs text-slate-500">Practice your speaking duration for each discussion phase.</p>
                    </div>

                    {/* Timer Widget */}
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl shadow-xs">
                      <Clock className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-black text-slate-900 min-w-[42px] text-center font-mono">
                        {formatTimer(timerSeconds)}
                      </span>
                      <button
                        onClick={() => setIsTimerRunning((prev) => !prev)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-700"
                      >
                        {isTimerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => {
                          setIsTimerRunning(false);
                          setTimerSeconds(60);
                        }}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedTopic.suggested_structure.map((phase, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border bg-white space-y-1.5 transition-all ${
                          activePhaseIndex === idx && isTimerRunning
                            ? 'border-indigo-500 ring-2 ring-indigo-200'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">{phase.phase}</span>
                          <button
                            onClick={() => handleStartPhaseTimer(idx, phase.duration_seconds)}
                            className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded text-[10px] font-bold flex items-center gap-1"
                          >
                            <Play className="h-2.5 w-2.5" />
                            {phase.duration_seconds}s
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{phase.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Self-Evaluation Rubric Checklist */}
                <div className="p-4 border border-slate-200 rounded-2xl bg-white space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <Award className="h-4 w-4 text-amber-500" />
                    Self-Evaluation Rubric Checklist
                  </div>
                  <div className="space-y-2">
                    {selectedTopic.evaluation_criteria.map((crit, idx) => {
                      const isChecked = Boolean(checkedCriteria[idx]);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleCheck(idx)}
                          className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                            isChecked
                              ? 'border-emerald-300 bg-emerald-50/40 text-emerald-900'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400 shrink-0" />
                          )}
                          <span className="text-xs font-medium">{crit}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Select a topic from the left to view structured preparation notes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
