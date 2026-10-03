import * as React from 'react';
import {
  Sparkles,
  BookOpen,
  FileText,
  AlignLeft,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Award,
  Layers,
  FileCode,
  ArrowRight,
} from 'lucide-react';
import { GenerateNotesRequest, NoteSourceType, NoteType, StudentLevel, NoteLength } from '../types/notes';
import { useGenerateNotes } from '../hooks/useNotes';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { useCourses } from '../../courses/hooks/useCourses';
import { coursesApi } from '../../courses/api/coursesApi';
import { apiClient } from '../../../api/client';

interface NotesGeneratorProps {
  initialCourseId?: string;
  initialLessonId?: string;
  initialTopic?: string;
  initialSelectedContent?: string;
  initialSourceType?: NoteSourceType;
  onGenerated?: (noteId: string) => void;
  onCancel?: () => void;
  compact?: boolean;
}

const GENERATION_STAGES = [
  'Preparing topic context & academic parameters...',
  'Retrieving authorized learning curriculum...',
  'Synthesizing structured notes with AI...',
  'Validating KaTeX formulas & code blocks...',
  'Saving to your private student repository...',
];

export function NotesGenerator({
  initialCourseId,
  initialLessonId,
  initialTopic = '',
  initialSelectedContent = '',
  initialSourceType = 'topic',
  onGenerated,
  onCancel,
  compact = false,
}: NotesGeneratorProps) {
  const [sourceType, setSourceType] = React.useState<NoteSourceType>(
    initialCourseId || initialLessonId ? 'lesson' : initialSourceType
  );
  const [topic, setTopic] = React.useState(initialTopic);
  const [selectedCourseId, setSelectedCourseId] = React.useState(initialCourseId || '');
  const [selectedLessonId, setSelectedLessonId] = React.useState(initialLessonId || '');
  const [selectedDocId, setSelectedDocId] = React.useState('');
  const [selectedContent, setSelectedContent] = React.useState(initialSelectedContent);
  const [level, setLevel] = React.useState<StudentLevel>('INTERMEDIATE');
  const [noteType, setNoteType] = React.useState<NoteType>('STUDY_NOTES');
  const [length, setLength] = React.useState<NoteLength>('MEDIUM');
  const [tagsInput, setTagsInput] = React.useState('');

  const [activeStageIndex, setActiveStageIndex] = React.useState(0);

  // Queries for dynamic course & document selectors
  const { courses } = useCourses({ limit: 30 });
  const [courseLessons, setCourseLessons] = React.useState<{ id: string; title: string; chapter: string }[]>([]);
  const [studentDocs, setStudentDocs] = React.useState<{ id: string; original_name: string }[]>([]);

  const generateMutation = useGenerateNotes();

  // Load lessons when selected course changes
  React.useEffect(() => {
    if (selectedCourseId) {
      coursesApi
        .getCourse(selectedCourseId)
        .then((c) => {
          const flatLessons = c.chapters.flatMap((ch) =>
            ch.lessons.map((l) => ({ id: l.id, title: l.title, chapter: ch.title }))
          );
          setCourseLessons(flatLessons);
          if (flatLessons.length > 0 && !selectedLessonId) {
            setSelectedLessonId(flatLessons[0].id);
          }
        })
        .catch(() => {});
    }
  }, [selectedCourseId, selectedLessonId]);

  // Load student documents if document tab opened
  React.useEffect(() => {
    if (sourceType === 'document') {
      apiClient
        .get<any[]>('/storage')
        .then((docs) => {
          if (Array.isArray(docs)) {
            setStudentDocs(docs);
            if (docs.length > 0 && !selectedDocId) {
              setSelectedDocId(docs[0].id);
            }
          }
        })
        .catch(() => {});
    }
  }, [sourceType, selectedDocId]);

  // Cycling generation stages for structured status feedback
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generateMutation.isPending) {
      setActiveStageIndex(0);
      interval = setInterval(() => {
        setActiveStageIndex((prev) => (prev < GENERATION_STAGES.length - 1 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [generateMutation.isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const payload: GenerateNotesRequest = {
      source_type: sourceType,
      level,
      note_type: noteType,
      length,
      tags: tags.length > 0 ? tags : undefined,
    };

    if (sourceType === 'topic') {
      if (!topic.trim()) return;
      payload.topic = topic.trim();
    } else if (sourceType === 'lesson') {
      if (!selectedLessonId) return;
      payload.lesson_id = selectedLessonId;
      payload.course_id = selectedCourseId;
    } else if (sourceType === 'course') {
      if (!selectedCourseId) return;
      payload.course_id = selectedCourseId;
    } else if (sourceType === 'document') {
      if (!selectedDocId) return;
      payload.document_id = selectedDocId;
    } else if (sourceType === 'selected_content') {
      if (!selectedContent.trim()) return;
      payload.selected_content = selectedContent.trim();
      payload.topic = topic.trim() || undefined;
    }

    generateMutation.mutate(payload, {
      onSuccess: (newNote) => {
        if (onGenerated) {
          onGenerated(newNote.id);
        }
      },
    });
  };

  return (
    <Card className="border border-[#E4E7EC] bg-white shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-[#E4E7EC] pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-[#101828]">
                AI Notes Generator
              </CardTitle>
              <p className="text-xs text-[#475467]">
                Generate structured, exam-calibrated academic notes with formulas & code.
              </p>
            </div>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs text-[#475467]">
              Cancel
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {generateMutation.isPending ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-5">
            <div className="relative">
              <RefreshCw className="h-10 w-10 text-[#2563EB] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-[#2563EB]" />
              </div>
            </div>

            <div className="max-w-md space-y-2">
              <h4 className="text-sm font-semibold text-[#101828]">Generating Academic Notes</h4>
              <p className="text-xs text-[#475467] font-mono transition-all duration-300">
                {GENERATION_STAGES[activeStageIndex]}
              </p>
            </div>

            {/* Stepper feedback */}
            <div className="w-full max-w-sm flex items-center justify-between pt-2">
              {GENERATION_STAGES.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 mx-0.5 rounded-full transition-colors duration-300 ${
                    idx <= activeStageIndex ? 'bg-[#2563EB]' : 'bg-[#E4E7EC]'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Source Tab Picker */}
            <div>
              <label className="block text-xs font-semibold text-[#101828] mb-2">
                Knowledge Source
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'topic', label: 'Custom Topic', icon: AlignLeft },
                  { id: 'lesson', label: 'Course Lesson', icon: BookOpen },
                  { id: 'document', label: 'Uploaded Doc', icon: FileText },
                  { id: 'selected_content', label: 'Selected Text', icon: FileCode },
                ].map((s) => {
                  const Icon = s.icon;
                  const isSelected = sourceType === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSourceType(s.id as NoteSourceType)}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-[#2563EB] bg-blue-50/60 text-[#2563EB] shadow-xs'
                          : 'border-[#E4E7EC] bg-white text-[#475467] hover:border-[#D0D5DD] hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Source Input Fields */}
            {sourceType === 'topic' && (
              <div>
                <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                  What do you want to create notes about?
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Normalization in DBMS, B-Trees & B+ Trees, Paging in OS..."
                  required
                  className="w-full h-10 px-3 rounded-lg border border-[#D0D5DD] text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
                />
                <p className="text-[11px] text-[#475467] mt-1">
                  Type any engineering subject, theorem, algorithm, or syllabus topic.
                </p>
              </div>
            )}

            {sourceType === 'lesson' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                    Select Course
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-[#D0D5DD] text-xs text-[#101828] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}: {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                    Select Curriculum Lesson
                  </label>
                  <select
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    required
                    disabled={!selectedCourseId || courseLessons.length === 0}
                    className="w-full h-10 px-3 rounded-lg border border-[#D0D5DD] text-xs text-[#101828] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">-- Choose Lesson --</option>
                    {courseLessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        [{l.chapter}] {l.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {sourceType === 'document' && (
              <div>
                <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                  Select Uploaded Document
                </label>
                {studentDocs.length === 0 ? (
                  <div className="p-3 border border-dashed border-[#D0D5DD] rounded-lg text-xs text-[#475467] text-center">
                    No documents uploaded yet. You can upload documents in the Documents module, or generate from Topic or Course.
                  </div>
                ) : (
                  <select
                    value={selectedDocId}
                    onChange={(e) => setSelectedDocId(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-[#D0D5DD] text-xs text-[#101828] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <option value="">-- Choose Verified Document --</option>
                    {studentDocs.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.original_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {sourceType === 'selected_content' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                    Topic / Concept Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Master Theorem Regularity Condition"
                    className="w-full h-9 px-3 rounded-lg border border-[#D0D5DD] text-xs text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                    Paste Lecture Excerpt or Text Snippet
                  </label>
                  <textarea
                    rows={4}
                    value={selectedContent}
                    onChange={(e) => setSelectedContent(e.target.value)}
                    placeholder="Paste textbook definitions, lecture transcript excerpts, or problem statements..."
                    required
                    className="w-full p-3 rounded-lg border border-[#D0D5DD] text-xs text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>
            )}

            {/* Note Parameters: Level, Type, Depth */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#F2F4F7]">
              {/* Target Level */}
              <div>
                <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                  Academic Depth
                </label>
                <div className="flex rounded-lg border border-[#D0D5DD] p-0.5 bg-[#F9FAFB]">
                  {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as StudentLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLevel(lvl)}
                      className={`flex-1 py-1 text-[11px] font-medium rounded transition-all ${
                        level === lvl
                          ? 'bg-white text-[#101828] shadow-xs'
                          : 'text-[#475467] hover:text-[#101828]'
                      }`}
                    >
                      {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note Type */}
              <div>
                <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                  Note Purpose
                </label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as NoteType)}
                  className="w-full h-8 px-2 rounded-lg border border-[#D0D5DD] text-xs text-[#101828] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="STUDY_NOTES">Study Notes (Concepts + Examples)</option>
                  <option value="EXAM_NOTES">Exam Notes (Formulas + GATE Tips)</option>
                  <option value="QUICK_REVISION">Quick Revision (Cheat Sheet)</option>
                  <option value="INTERVIEW_NOTES">Interview Notes (Trade-offs + Q&A)</option>
                  <option value="DETAILED_NOTES">Detailed Notes (Full Rigor)</option>
                </select>
              </div>

              {/* Content Length */}
              <div>
                <label className="block text-xs font-semibold text-[#101828] mb-1.5">
                  Length Density
                </label>
                <div className="flex rounded-lg border border-[#D0D5DD] p-0.5 bg-[#F9FAFB]">
                  {(['SHORT', 'MEDIUM', 'DETAILED'] as NoteLength[]).map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setLength(len)}
                      className={`flex-1 py-1 text-[11px] font-medium rounded transition-all ${
                        length === len
                          ? 'bg-white text-[#101828] shadow-xs'
                          : 'text-[#475467] hover:text-[#101828]'
                      }`}
                    >
                      {len.charAt(0) + len.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Tags */}
            {!compact && (
              <div>
                <label className="block text-xs font-semibold text-[#101828] mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. DBMS, Semester4, GatePrep"
                  className="w-full h-8 px-3 rounded-lg border border-[#D0D5DD] text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              {onCancel && (
                <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={
                  generateMutation.isPending ||
                  (sourceType === 'topic' && !topic.trim()) ||
                  (sourceType === 'lesson' && !selectedLessonId) ||
                  (sourceType === 'document' && !selectedDocId) ||
                  (sourceType === 'selected_content' && !selectedContent.trim())
                }
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs h-9 px-4 font-medium flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Generate Notes
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
