import * as React from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Layers,
  Clock,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { adminApi } from '../../../api/adminApi';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';

export function AdminContentPage() {
  const [courses, setCourses] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // New course form
  const [formData, setFormData] = React.useState({
    title: '',
    code: '',
    description: '',
    branch: 'Computer Science & Engineering',
    semester: 6,
    difficulty: 'INTERMEDIATE',
    estimated_hours: 45,
  });

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getCourses();
      setCourses(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.code.trim()) {
      toast.error('Title and Course Code are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminApi.createCourse(formData);
      toast.success('Course created and published successfully');
      setCreateDialogOpen(false);
      setFormData({
        title: '',
        code: '',
        description: '',
        branch: 'Computer Science & Engineering',
        semester: 6,
        difficulty: 'INTERMEDIATE',
        estimated_hours: 45,
      });
      fetchCourses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.code?.toLowerCase().includes(q) ||
      c.branch?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            Academic Content & Curriculum
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Author and inspect formal B.Tech curriculum courses, chapter modules, and syllabus invariants.
          </p>
        </div>

        <button
          onClick={() => setCreateDialogOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto shadow-lg shadow-amber-950/20"
        >
          <Plus className="h-4 w-4" />
          Create New Course
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0D1836] border border-[#1A284D] flex items-center gap-3">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter courses by title, branch, or course code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin text-amber-500 mb-3" />
          <p className="text-sm">Loading course curriculum records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-[#0D1836] border border-[#1A284D] hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {c.code || 'CS301'}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Published
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm mb-1 line-clamp-1">{c.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {c.description || c.short_description || 'Structured engineering learning module with syllabus coverage.'}
                </p>
              </div>

              <div className="pt-3 border-t border-[#182649] flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5 text-amber-400" />
                  Sem {c.semester}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-cyan-400" />
                  {c.estimated_minutes ? `${Math.round(c.estimated_minutes / 60)} hrs` : '45 hrs'}
                </span>
                <span className="text-slate-300 font-medium">{c.difficulty}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      {createDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-lg w-full bg-[#0D1836] border border-[#1A284D] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create Academic Course</h3>
            <p className="text-xs text-slate-400">
              Add a new course curriculum module to the platform catalog.
            </p>

            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus & Cloud Storage"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#081024] border border-[#1E2E55] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS602"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl bg-[#081024] border border-[#1E2E55] text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value, 10) })}
                    className="w-full mt-1 p-2.5 rounded-xl bg-[#081024] border border-[#1E2E55] text-white focus:outline-none focus:border-amber-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium">Engineering Branch</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#081024] border border-[#1E2E55] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of syllabus, theoretical foundations, and lab assignments..."
                  className="w-full mt-1 p-2.5 rounded-xl bg-[#081024] border border-[#1E2E55] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateDialogOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#14234B] text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
                >
                  {isSubmitting ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
