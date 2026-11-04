import * as React from 'react';
import {
  BookOpen,
  Plus,
  Layers,
  FileText,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Search,
  Clock,
  Award,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { coursesApi } from '../api/coursesApi';
import { AcademicSubjectOption, CourseDifficulty } from '../types/courses';
import { useAuth } from '../../../hooks/useAuth';
import { apiClient } from '../../../api/client';
import { toast } from 'sonner';

interface AddCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (path: string) => void;
  onCourseCreated?: () => void;
}

export function AddCourseModal({
  open,
  onOpenChange,
  onNavigate,
  onCourseCreated,
}: AddCourseModalProps) {
  const { student } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'academic' | 'custom' | 'import'>('academic');

  // Tab A: Academic Subjects state
  const [academicSubjects, setAcademicSubjects] = React.useState<AcademicSubjectOption[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = React.useState(false);
  const [enrollingSubjectId, setEnrollingSubjectId] = React.useState<string | null>(null);
  const [subjectSearch, setSubjectSearch] = React.useState('');

  // Tab B: Custom Course form state
  const [customTitle, setCustomTitle] = React.useState('');
  const [customCode, setCustomCode] = React.useState('');
  const [customDescription, setCustomDescription] = React.useState('');
  const [customBranch, setCustomBranch] = React.useState(student?.branch || 'CSE');
  const [customSemester, setCustomSemester] = React.useState<number>(student?.semester || 6);
  const [customAcademicYear, setCustomAcademicYear] = React.useState('2025-2026');
  const [customCategory, setCustomCategory] = React.useState('Core Subject');
  const [customDifficulty, setCustomDifficulty] = React.useState<CourseDifficulty>('Intermediate');
  const [customInstructor, setCustomInstructor] = React.useState('');
  const [customObjectives, setCustomObjectives] = React.useState('');
  const [isSubmittingCustom, setIsSubmittingCustom] = React.useState(false);
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  // Tab C: Import Content state
  const [availableDocs, setAvailableDocs] = React.useState<any[]>([]);
  const [availableNotes, setAvailableNotes] = React.useState<any[]>([]);
  const [selectedDocIds, setSelectedDocIds] = React.useState<string[]>([]);
  const [selectedNoteIds, setSelectedNoteIds] = React.useState<string[]>([]);
  const [isLoadingResources, setIsLoadingResources] = React.useState(false);

  // Fetch academic subjects on modal open
  React.useEffect(() => {
    if (open) {
      loadAcademicSubjects();
      loadStudentResources();
      if (student?.branch) setCustomBranch(student.branch);
      if (student?.semester) setCustomSemester(student.semester);
    }
  }, [open, student]);

  const loadAcademicSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      const data = await coursesApi.getAcademicSubjects();
      setAcademicSubjects(data);
    } catch (err: any) {
      console.warn('Could not load academic subjects:', err);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const loadStudentResources = async () => {
    setIsLoadingResources(true);
    try {
      const [docsRes, notesRes] = await Promise.all([
        apiClient.get('/documents?limit=20').catch(() => ({ data: { items: [] } })),
        apiClient.get('/notes?limit=20').catch(() => ({ data: { items: [] } })),
      ]);
      setAvailableDocs(docsRes.data?.items || docsRes.data || []);
      setAvailableNotes(notesRes.data?.items || notesRes.data || []);
    } catch {
      // Graceful fallback
    } finally {
      setIsLoadingResources(false);
    }
  };

  const handleEnrollSubject = async (subjectId: string) => {
    setEnrollingSubjectId(subjectId);
    try {
      const course = await coursesApi.enrollAcademicSubject(subjectId);
      toast.success(`Successfully added ${course.title} to your learning workspace!`);
      onCourseCreated?.();
      onOpenChange(false);
      onNavigate(`/courses/${course.id}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add subject');
    } finally {
      setEnrollingSubjectId(null);
    }
  };

  const validateCustomForm = () => {
    const errors: Record<string, string> = {};
    if (!customTitle.trim()) {
      errors.title = 'Course title is required';
    }
    if (customSemester < 1 || customSemester > 8) {
      errors.semester = 'Semester must be between 1 and 8';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCustomCourse = async (withImports: boolean = false) => {
    if (!validateCustomForm()) return;

    setIsSubmittingCustom(true);
    try {
      const objectives = customObjectives
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const course = await coursesApi.createCourse({
        title: customTitle.trim(),
        code: customCode.trim() || undefined,
        description: customDescription.trim() || undefined,
        branch: customBranch,
        semester: customSemester,
        academic_year: customAcademicYear,
        category: customCategory,
        difficulty: customDifficulty,
        instructor: customInstructor.trim() || undefined,
        learning_objectives: objectives.length > 0 ? objectives : undefined,
        linked_document_ids: withImports ? selectedDocIds : undefined,
        linked_note_ids: withImports ? selectedNoteIds : undefined,
      });

      toast.success(`Course "${course.title}" created successfully!`);
      onCourseCreated?.();
      onOpenChange(false);
      resetForms();
      onNavigate(`/courses/${course.id}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create course');
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  const resetForms = () => {
    setCustomTitle('');
    setCustomCode('');
    setCustomDescription('');
    setCustomObjectives('');
    setCustomInstructor('');
    setSelectedDocIds([]);
    setSelectedNoteIds([]);
    setFormErrors({});
  };

  const filteredSubjects = academicSubjects.filter(
    (s) =>
      s.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      s.subject_type.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Add Course to Workspace
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Enroll in academic curriculum subjects, create custom modules, or import learning materials.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full mt-2"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="academic" className="text-xs">
              Curriculum Subjects
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-xs">
              Custom Course
            </TabsTrigger>
            <TabsTrigger value="import" className="text-xs">
              Import Content
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: ACADEMIC CURRICULUM SUBJECTS (OPTION A) */}
          <TabsContent value="academic" className="space-y-4 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search subjects by name, code (e.g. CS601)..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            {isLoadingSubjects ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Loading semester curriculum subjects...
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="py-8 text-center space-y-2 border rounded-xl border-dashed p-6">
                <Layers className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No subjects found</p>
                <p className="text-[11px] text-slate-500">
                  {subjectSearch
                    ? 'No curriculum subjects matched your search.'
                    : 'No curriculum subjects configured for your semester yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {filteredSubjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/20 transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded text-[10px] border border-blue-100">
                          {sub.code}
                        </span>
                        <h4 className="font-bold text-slate-900 truncate">{sub.name}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>{sub.subject_type}</span>
                        <span>·</span>
                        <span>{sub.units_count} Units</span>
                        <span>·</span>
                        <span>{sub.credits} Credits</span>
                        <span>·</span>
                        <span className="capitalize">{sub.difficulty.toLowerCase()}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {sub.is_enrolled ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onOpenChange(false);
                            onNavigate(`/courses/${sub.existing_course_id}`);
                          }}
                          className="text-xs gap-1 text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>In Workspace</span>
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={enrollingSubjectId === sub.id}
                          onClick={() => handleEnrollSubject(sub.id)}
                          className="text-xs gap-1.5 shadow-2xs"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>{enrollingSubjectId === sub.id ? 'Adding...' : 'Add to Workspace'}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: CUSTOM COURSE CREATION (OPTION B) */}
          <TabsContent value="custom" className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700">Course Title *</label>
                <Input
                  placeholder="e.g. Distributed Cloud Systems & Microservices"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className={`text-xs h-9 ${formErrors.title ? 'border-rose-500' : ''}`}
                />
                {formErrors.title && (
                  <p className="text-[10px] text-rose-500">{formErrors.title}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Course Code (Optional)</label>
                <Input
                  placeholder="e.g. CS608"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="text-xs h-9 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Instructor Name</label>
                <Input
                  placeholder="e.g. Prof. Arvind Kumar or Self-Directed"
                  value={customInstructor}
                  onChange={(e) => setCustomInstructor(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Semester</label>
                <select
                  value={customSemester}
                  onChange={(e) => setCustomSemester(Number(e.target.value))}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Branch</label>
                <select
                  value={customBranch}
                  onChange={(e) => setCustomBranch(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                >
                  {['CSE', 'AIML', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil'].map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Subject Category</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                >
                  <option value="Core Subject">Core Subject</option>
                  <option value="Program Elective">Program Elective</option>
                  <option value="Open Elective">Open Elective</option>
                  <option value="Laboratory Course">Laboratory Course</option>
                  <option value="Self Study Track">Self Study Track</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Difficulty Level</label>
                <select
                  value={customDifficulty}
                  onChange={(e) => setCustomDifficulty(e.target.value as any)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  placeholder="Overview of this coursework, scope, and engineering applications..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700">
                  Learning Objectives (One objective per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Understand distributed consensus protocols&#10;Implement Raft leader election in Go/Rust&#10;Analyze partition tolerance trade-offs"
                  value={customObjectives}
                  onChange={(e) => setCustomObjectives(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isSubmittingCustom}
                onClick={() => handleCreateCustomCourse(false)}
                className="gap-1.5 shadow-xs"
              >
                <span>{isSubmittingCustom ? 'Creating Course...' : 'Create Course'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </TabsContent>

          {/* TAB 3: IMPORT CONTENT & LINK EXISTING DOCUMENTS/NOTES (OPTION C) */}
          <TabsContent value="import" className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="font-bold text-xs text-slate-700">Course Title *</label>
              <Input
                placeholder="e.g. Operating Systems & Kernel Architecture"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className={`text-xs h-9 ${formErrors.title ? 'border-rose-500' : ''}`}
              />
              {formErrors.title && (
                <p className="text-[10px] text-rose-500">{formErrors.title}</p>
              )}
            </div>

            {/* Associate Documents */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                  <span>Attach Uploaded Documents from Library</span>
                </label>
                <span className="text-[10px] text-slate-500">
                  {selectedDocIds.length} selected
                </span>
              </div>

              {isLoadingResources ? (
                <p className="text-xs text-slate-400 py-3">Loading documents...</p>
              ) : availableDocs.length === 0 ? (
                <p className="text-xs text-slate-500 p-3 bg-slate-50 rounded-lg">
                  No documents found in your library. You can upload PDFs in the Documents tab anytime.
                </p>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5 border rounded-lg p-2 bg-slate-50/50">
                  {availableDocs.map((doc: any) => {
                    const isSelected = selectedDocIds.includes(doc.id);
                    return (
                      <div
                        key={doc.id}
                        onClick={() =>
                          setSelectedDocIds((prev) =>
                            isSelected ? prev.filter((id) => id !== doc.id) : [...prev, doc.id]
                          )
                        }
                        className={`flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300 text-blue-900 font-medium'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-blue-600"
                          />
                          <span className="truncate">{doc.title || doc.filename}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 text-[10px] text-slate-500">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                            {doc.status || 'READY'}
                          </span>
                          {doc.file_size && (
                            <span>{Math.round(doc.file_size / 1024)} KB</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Associate Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileCheck className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Attach Saved Notes from Notes Module</span>
                </label>
                <span className="text-[10px] text-slate-500">
                  {selectedNoteIds.length} selected
                </span>
              </div>

              {availableNotes.length === 0 ? (
                <p className="text-xs text-slate-500 p-3 bg-slate-50 rounded-lg">
                  No notes found in your account. You can create revision notes in the Notes tab.
                </p>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5 border rounded-lg p-2 bg-slate-50/50">
                  {availableNotes.map((note: any) => {
                    const isSelected = selectedNoteIds.includes(note.id);
                    return (
                      <div
                        key={note.id}
                        onClick={() =>
                          setSelectedNoteIds((prev) =>
                            isSelected ? prev.filter((id) => id !== note.id) : [...prev, note.id]
                          )
                        }
                        className={`flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-medium'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-indigo-600"
                          />
                          <span className="truncate">{note.title}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                          {note.note_type || 'NOTES'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isSubmittingCustom}
                onClick={() => handleCreateCustomCourse(true)}
                className="gap-1.5 shadow-xs"
              >
                <span>{isSubmittingCustom ? 'Importing & Creating...' : 'Create with Imported Content'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
