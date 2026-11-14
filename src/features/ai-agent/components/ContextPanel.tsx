import * as React from 'react';
import {
  Compass,
  BookOpen,
  FolderKanban,
  Target,
  Sparkles,
  ArrowRight,
  X,
  GraduationCap,
  FileText,
  Code2,
  Database,
  BrainCircuit,
  Layers,
  HelpCircle,
  CalendarCheck,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useAIContext, useTutorContextOptions } from '../hooks/useAIContext';
import { SelectedTutorContext } from '../types/ai';
import { Skeleton } from '../../../components/ui/feedback';

export function ContextPanel({
  selectedContext,
  onContextChange,
  onSelectPrompt,
  onCloseMobile,
  onNavigate,
}: {
  selectedContext: SelectedTutorContext;
  onContextChange: (ctx: SelectedTutorContext) => void;
  onSelectPrompt: (prompt: string) => void;
  onCloseMobile?: () => void;
  onNavigate?: (path: string) => void;
}) {
  const { data: context, isLoading: isContextLoading } = useAIContext();
  const { data: optionsData, isLoading: isOptionsLoading } = useTutorContextOptions();

  const [courseSearch, setCourseSearch] = React.useState('');
  const [showCourseDropdown, setShowCourseDropdown] = React.useState(false);

  const teachingModes = optionsData?.teachingModes || [
    { id: 'EXPLAIN', name: 'Mode A: Explain a Concept', desc: 'Clear, intuitive breakdown' },
    { id: 'STEP_BY_STEP', name: 'Mode B: Teach Me Step by Step', desc: 'Socratic staged breakdown' },
    { id: 'SOLVE', name: 'Mode C: Solve a Problem', desc: 'Detailed intermediate derivations' },
    { id: 'EXAM_PREP', name: 'Mode D: Exam Preparation', desc: 'Syllabus blueprints & formulas' },
    { id: 'CODING', name: 'Mode E: Coding Tutor', desc: 'Code inspection & bug diagnosis' },
    { id: 'INTERVIEW', name: 'Mode F: Technical Interview', desc: 'DSA & core CS trade-offs' },
    { id: 'REVISION', name: 'Mode G: Spaced Revision', desc: 'Active recall flashcards & quiz' },
  ];

  const difficultyLevels = optionsData?.difficultyLevels || [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Exam',
    'Interview',
  ];

  const filteredCourses = (optionsData?.courses || []).filter((c) =>
    c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
    (c.category && c.category.toLowerCase().includes(courseSearch.toLowerCase()))
  );

  const toggleDocument = (docId: string) => {
    const current = selectedContext.documentIds || [];
    const updated = current.includes(docId)
      ? current.filter((id) => id !== docId)
      : [...current, docId];
    onContextChange({ ...selectedContext, documentIds: updated });
  };

  if (isContextLoading) {
    return (
      <div className="p-4 space-y-4 bg-white border-l border-slate-200 h-full overflow-y-auto">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 overflow-y-auto p-4 space-y-4 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-800">
          <Compass className="h-4 w-4 text-blue-600" />
          <h3 className="font-bold uppercase tracking-wider text-[11px]">Tutor Controls</h3>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 md:hidden cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Student Academic Profile Badge */}
      {context?.student && (
        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-blue-600" />
              <span className="font-bold text-slate-900">{context.student.name}</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-600">
              Sem {context.student.semester}
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            {context.student.branch || 'Computer Science & Engineering'}
          </p>
        </div>
      )}

      {/* 1. Teaching Mode Selection */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Teaching Mode
        </label>
        <select
          aria-label="Tutor mode"
          value={selectedContext.mode || 'EXPLAIN'}
          onChange={(e) => onContextChange({ ...selectedContext, mode: e.target.value })}
          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
        >
          {teachingModes.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <p className="text-[10px] text-slate-500 italic">
          {teachingModes.find((m) => m.id === (selectedContext.mode || 'EXPLAIN'))?.desc}
        </p>
      </div>

      {/* 2. Difficulty Level */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Difficulty & Depth
        </label>
        <div className="grid grid-cols-3 gap-1">
          {difficultyLevels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => onContextChange({ ...selectedContext, difficulty: lvl })}
              className={`py-1.5 px-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer text-center ${
                (selectedContext.difficulty || 'Intermediate') === lvl
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Subject & Course Selection */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Course & Syllabus
          </label>
          {selectedContext.courseId && (
            <button
              onClick={() =>
                onContextChange({
                  ...selectedContext,
                  courseId: undefined,
                  courseName: undefined,
                  lessonId: undefined,
                  lessonTitle: undefined,
                })
              }
              className="text-[10px] text-rose-600 hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {selectedContext.courseId ? (
          <div className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-1.5">
            <div className="flex items-start justify-between gap-1">
              <div>
                <span className="text-[10px] font-bold text-blue-600">Active Course</span>
                <p className="font-bold text-slate-900 line-clamp-1">{selectedContext.courseName}</p>
              </div>
              <BookOpen className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
            </div>
            <button
              onClick={() =>
                onSelectPrompt(
                  `Explain the core concepts and exam invariants of ${selectedContext.courseName}.`
                )
              }
              className="w-full py-1 px-2 rounded-lg bg-white border border-blue-200 text-blue-600 font-semibold text-[11px] hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Ask About Syllabus</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowCourseDropdown(!showCourseDropdown)}
              className="w-full p-2 text-left rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-between text-xs cursor-pointer"
            >
              <span className="truncate">Select from 100+ Courses...</span>
              <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            </button>

            {showCourseDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto p-2 space-y-1">
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Search course name or code..."
                  className="w-full p-1.5 text-xs border border-slate-200 rounded-md mb-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                {filteredCourses.slice(0, 30).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onContextChange({
                        ...selectedContext,
                        courseId: c.id,
                        courseName: c.name,
                      });
                      setShowCourseDropdown(false);
                      setCourseSearch('');
                    }}
                    className="w-full text-left p-1.5 hover:bg-blue-50 rounded-md text-[11px] flex items-center justify-between group cursor-pointer"
                  >
                    <span className="font-medium text-slate-800 truncate pr-1">{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{c.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Grounding with Student Documents & Notes */}
      {optionsData?.documents && optionsData.documents.length > 0 && (
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Ground in My Materials (RAG)
          </label>
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {optionsData.documents.slice(0, 6).map((doc) => {
              const isChecked = (selectedContext.documentIds || []).includes(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleDocument(doc.id)}
                  className={`p-2 rounded-lg border text-[11px] flex items-center justify-between cursor-pointer transition-all ${
                    isChecked
                      ? 'border-indigo-300 bg-indigo-50/50 text-indigo-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate pr-1">
                    <FileText className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">{doc.title}</span>
                  </div>
                  {isChecked && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Remedial / Weak Areas */}
      {context?.weak_areas && context.weak_areas.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">
            <Target className="h-3 w-3 text-amber-600" />
            <span>Target Weak Areas</span>
          </div>
          <div className="space-y-1">
            {context.weak_areas.slice(0, 3).map((weak, i) => (
              <button
                key={i}
                onClick={() =>
                  onSelectPrompt(
                    `Give me a step-by-step intuition and practice problem for my weak topic: ${weak}.`
                  )
                }
                className="w-full p-2 text-left rounded-lg border border-amber-200/80 bg-amber-50/30 hover:bg-amber-50 text-slate-800 transition-colors cursor-pointer group flex items-center justify-between"
              >
                <span className="truncate pr-1 text-[11px] font-medium">{weak}</span>
                <ArrowRight className="h-3 w-3 text-amber-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Quick Interactive Platform Labs & Modules */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Connected Labs &amp; Modules
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onNavigate?.('/placements/coding')}
            className="p-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-colors flex items-center gap-1.5 cursor-pointer text-slate-700"
          >
            <Code2 className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-[11px] font-medium">Coding Lab</span>
          </button>
          <button
            onClick={() => onNavigate?.('/dsa')}
            className="p-2 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-left transition-colors flex items-center gap-1.5 cursor-pointer text-slate-700"
          >
            <BrainCircuit className="h-3.5 w-3.5 text-purple-600" />
            <span className="text-[11px] font-medium">DSA Lab</span>
          </button>
          <button
            onClick={() => onNavigate?.('/sql-lab')}
            className="p-2 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-colors flex items-center gap-1.5 cursor-pointer text-slate-700"
          >
            <Database className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[11px] font-medium">SQL Lab</span>
          </button>
          <button
            onClick={() => onNavigate?.('/quiz')}
            className="p-2 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 text-left transition-colors flex items-center gap-1.5 cursor-pointer text-slate-700"
          >
            <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-[11px] font-medium">Quizzes</span>
          </button>
          <button
            onClick={() => onNavigate?.('/notes')}
            className="p-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-colors flex items-center gap-1.5 cursor-pointer text-slate-700"
          >
            <Layers className="h-3.5 w-3.5 text-indigo-600" />
            <span className="text-[11px] font-medium">Flashcards</span>
          </button>
          <button
            onClick={() => onNavigate?.('/semester-command-center/daily-plan')}
            className="p-2 rounded-lg border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/40 text-left transition-colors flex items-center gap-1.5 cursor-pointer text-slate-700"
          >
            <CalendarCheck className="h-3.5 w-3.5 text-cyan-600" />
            <span className="text-[11px] font-medium">Study Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
