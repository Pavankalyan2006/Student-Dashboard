// src/features/gate/components/GateSyllabusExplorer.tsx
import React, { useState } from 'react';
import { GateSyllabusSection, GateSyllabusTopic, TopicStatus, StudentConfidence } from '../types/gateTypes';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  Bookmark,
  FileText,
  Search,
  BookOpen,
  Sparkles,
  ExternalLink,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface GateSyllabusExplorerProps {
  sections: GateSyllabusSection[];
  onUpdateTopicStatus: (
    topicId: string,
    data: {
      status?: TopicStatus;
      confidence?: StudentConfidence;
      revision_flag?: boolean;
      student_notes?: string;
    }
  ) => Promise<void>;
  onPracticeTopic: (topicId: string) => void;
  onAskAiTopic: (topic: GateSyllabusTopic) => void;
}

export const GateSyllabusExplorer: React.FC<GateSyllabusExplorerProps> = ({
  sections,
  onUpdateTopicStatus,
  onPracticeTopic,
  onAskAiTopic,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    // Expand first two sections by default
    const init: Record<string, boolean> = {};
    if (sections[0]) init[sections[0].id] = true;
    if (sections[1]) init[sections[1].id] = true;
    return init;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterImportance, setFilterImportance] = useState('ALL');
  const [editingNotesTopicId, setEditingNotesTopicId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  const toggleSection = (secId: string) => {
    setExpandedSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  const handleStatusChange = async (topic: GateSyllabusTopic, newStatus: TopicStatus) => {
    await onUpdateTopicStatus(topic.id, { status: newStatus });
  };

  const handleConfidenceChange = async (topic: GateSyllabusTopic, newConfidence: StudentConfidence) => {
    await onUpdateTopicStatus(topic.id, { confidence: newConfidence });
  };

  const handleToggleRevision = async (topic: GateSyllabusTopic) => {
    await onUpdateTopicStatus(topic.id, { revision_flag: !topic.revision_flag });
  };

  const handleSaveNotes = async (topicId: string) => {
    await onUpdateTopicStatus(topicId, { student_notes: notesText });
    setEditingNotesTopicId(null);
  };

  // Filter sections and topics
  const filteredSections = sections.map((sec) => {
    const matchingTopics = sec.topics.filter((top) => {
      const matchQ =
        top.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        top.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        top.key_concepts.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchImp = filterImportance === 'ALL' || top.importance === filterImportance;
      return matchQ && matchImp;
    });
    return { ...sec, topics: matchingTopics };
  }).filter((sec) => sec.topics.length > 0);

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topics, algorithms, or concepts (e.g. Master Theorem, Paging, B-Tree)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Importance:</span>
          {['ALL', 'VERY_HIGH', 'HIGH', 'MEDIUM'].map((imp) => (
            <button
              key={imp}
              onClick={() => setFilterImportance(imp)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                filterImportance === imp
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {imp.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Sections Accordion */}
      <div className="space-y-4">
        {filteredSections.map((sec) => {
          const isExpanded = !!expandedSections[sec.id];
          const completedCount = sec.topics.filter((t) => t.status === 'COMPLETED').length;
          const totalCount = sec.topics.length;
          const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div
              key={sec.id}
              className="border border-slate-800 rounded-2xl bg-slate-900/90 overflow-hidden shadow-xs transition-all"
            >
              {/* Section Header */}
              <div
                onClick={() => toggleSection(sec.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button className="text-slate-400 hover:text-white">
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-indigo-400" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white">{sec.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                        ~{sec.weightage_approx_percent}% Weightage
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{sec.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-xs font-bold text-slate-200">
                      {completedCount}/{totalCount} Completed
                    </span>
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 w-8">{pct}%</span>
                </div>
              </div>

              {/* Topics List */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-slate-800/80 space-y-3 bg-slate-950/40">
                  {sec.topics.map((top) => {
                    const isCompleted = top.status === 'COMPLETED';
                    const isInProgress = top.status === 'IN_PROGRESS';
                    const isEditingNotes = editingNotesTopicId === top.id;

                    return (
                      <div
                        key={top.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isCompleted
                            ? 'border-emerald-500/20 bg-emerald-500/5'
                            : isInProgress
                            ? 'border-indigo-500/30 bg-indigo-500/5'
                            : 'border-slate-800/80 bg-slate-900/60'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                          {/* Left: Info */}
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-white">{top.name}</span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                                  top.importance === 'VERY_HIGH'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : top.importance === 'HIGH'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-slate-700 text-slate-300'
                                }`}
                              >
                                {top.importance.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-indigo-400 font-mono">
                                • {top.pyq_frequency}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">{top.description}</p>

                            {/* Key Concepts Pills */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {top.key_concepts.map((concept, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
                                >
                                  {concept}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 shrink-0">
                            {/* Status Selector */}
                            <select
                              value={top.status || 'NOT_STARTED'}
                              onChange={(e) => handleStatusChange(top, e.target.value as TopicStatus)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border focus:outline-hidden cursor-pointer ${
                                isCompleted
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                  : isInProgress
                                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                                  : 'bg-slate-800 border-slate-700 text-slate-300'
                              }`}
                            >
                              <option value="NOT_STARTED">Not Started</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="COMPLETED">Mastered</option>
                            </select>

                            {/* Confidence Rating */}
                            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                              {(['LOW', 'MEDIUM', 'HIGH'] as StudentConfidence[]).map((conf) => (
                                <button
                                  key={conf}
                                  onClick={() => handleConfidenceChange(top, conf)}
                                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                                    top.confidence === conf
                                      ? conf === 'HIGH'
                                        ? 'bg-emerald-500 text-white'
                                        : conf === 'MEDIUM'
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-rose-500 text-white'
                                      : 'text-slate-500 hover:text-slate-300'
                                  }`}
                                >
                                  {conf[0]}
                                </button>
                              ))}
                            </div>

                            {/* Revision Flag */}
                            <button
                              onClick={() => handleToggleRevision(top)}
                              title={top.revision_flag ? 'Marked for revision' : 'Flag for revision'}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                top.revision_flag
                                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>

                            {/* Notes Button */}
                            <button
                              onClick={() => {
                                setEditingNotesTopicId(isEditingNotes ? null : top.id);
                                setNotesText(top.student_notes || '');
                              }}
                              title="Personal Study Notes"
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                top.student_notes
                                  ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            {/* Ask AI Tutor */}
                            <button
                              onClick={() => onAskAiTopic(top)}
                              title="Explain with AI Tutor"
                              className="p-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>

                            {/* Practice Topic PYQs */}
                            <Button
                              onClick={() => onPracticeTopic(top.id)}
                              size="sm"
                              className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2.5"
                            >
                              Practice PYQs
                            </Button>
                          </div>
                        </div>

                        {/* Notes Drawer / Editor */}
                        {isEditingNotes && (
                          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-indigo-400" />
                              Personal Revision Notes & Formulas for {top.name}
                            </label>
                            <textarea
                              rows={3}
                              value={notesText}
                              onChange={(e) => setNotesText(e.target.value)}
                              placeholder="Add personal notes, edge case observations, or memory formulas..."
                              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingNotesTopicId(null)}
                                className="h-7 text-xs border-slate-700 text-slate-300"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveNotes(top.id)}
                                className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                              >
                                Save Notes
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Existing Notes Display */}
                        {!isEditingNotes && top.student_notes && (
                          <div className="mt-2.5 p-2.5 bg-slate-950/80 border border-indigo-500/20 rounded-lg text-xs text-indigo-200/90 font-mono">
                            <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-0.5">Note:</span>
                            {top.student_notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-semibold">No syllabus topics match your query.</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
