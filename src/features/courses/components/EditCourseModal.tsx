import * as React from 'react';
import { Pencil, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { CourseWithDetails, CourseDifficulty, CourseCardData } from '../types/courses';
import { coursesApi } from '../api/coursesApi';
import { toast } from 'sonner';

interface EditCourseModalProps {
  course: CourseWithDetails | CourseCardData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

export function EditCourseModal({ course, open, onOpenChange, onUpdated }: EditCourseModalProps) {
  const [title, setTitle] = React.useState(course.title);
  const [code, setCode] = React.useState(course.code);
  const [description, setDescription] = React.useState(course.description || '');
  const [branch, setBranch] = React.useState(course.branch || 'CSE');
  const [semester, setSemester] = React.useState<number>(course.semester || 6);
  const [academicYear, setAcademicYear] = React.useState(course.academic_year || '2025-2026');
  const [category, setCategory] = React.useState(course.category || 'Core Subject');
  const [difficulty, setDifficulty] = React.useState<CourseDifficulty>(course.difficulty || 'Intermediate');
  const [instructor, setInstructor] = React.useState(course.instructor || '');
  const [objectives, setObjectives] = React.useState((course.learning_objectives || []).join('\n'));
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setTitle(course.title);
      setCode(course.code);
      setDescription(course.description || '');
      setBranch(course.branch || 'CSE');
      setSemester(course.semester || 6);
      setAcademicYear(course.academic_year || '2025-2026');
      setCategory(course.category || 'Core Subject');
      setDifficulty(course.difficulty || 'Intermediate');
      setInstructor(course.instructor || '');
      setObjectives((course.learning_objectives || []).join('\n'));
      setError('');
    }
  }, [open, course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Course title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const objList = objectives
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      await coursesApi.updateCourse(course.id, {
        title: title.trim(),
        code: code.trim(),
        description: description.trim(),
        branch,
        semester,
        academic_year: academicYear,
        category,
        difficulty,
        instructor: instructor.trim() || undefined,
        learning_objectives: objList.length > 0 ? objList : undefined,
      });

      toast.success('Course details updated successfully!');
      onUpdated?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Pencil className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Edit Course Details
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Update course information, academic metadata, and syllabus objectives.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs pt-2">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Course Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs h-9"
              placeholder="e.g. Distributed Operating Systems"
            />
            {error && <p className="text-[10px] text-rose-500">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Course Code</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-xs h-9 font-mono"
                placeholder="e.g. CS601"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Instructor</label>
              <Input
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="text-xs h-9"
                placeholder="e.g. Self-Directed Study"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full h-9 px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full h-9 px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
              >
                {['CSE', 'AIML', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil'].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full h-9 px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Subject Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
            <label className="font-bold text-slate-700">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">
              Learning Objectives (One objective per line)
            </label>
            <textarea
              rows={3}
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5 shadow-xs"
            >
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
