import * as React from 'react';
import {
  ArrowLeft,
  Activity,
  Search,
  Filter,
  BookOpen,
  HelpCircle,
  Code2,
  Binary,
  GraduationCap,
  Hammer,
  Award,
  RefreshCw,
} from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import { StudentActivity } from '../../../../server/models/communityProfileProgressTypes';
import { toast } from 'sonner';

export function ProfileActivityPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [activities, setActivities] = React.useState<StudentActivity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('ALL');

  React.useEffect(() => {
    loadActivities();
  }, [selectedType]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await communityProfileApi.getActivity({
        type: selectedType === 'ALL' ? undefined : selectedType,
      });
      setActivities(data);
    } catch {
      toast.error('Failed to load learning activity history');
    } finally {
      setLoading(false);
    }
  };

  const filtered = activities.filter((act) => {
    if (!search.trim()) return true;
    return (
      act.title.toLowerCase().includes(search.toLowerCase()) ||
      act.activity_type.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getActivityIcon = (type: string) => {
    if (type.includes('COURSE')) return <BookOpen className="h-4 w-4 text-blue-600" />;
    if (type.includes('QUIZ')) return <HelpCircle className="h-4 w-4 text-amber-600" />;
    if (type.includes('CODING')) return <Code2 className="h-4 w-4 text-emerald-600" />;
    if (type.includes('DSA')) return <Binary className="h-4 w-4 text-cyan-600" />;
    if (type.includes('PROJECT')) return <Hammer className="h-4 w-4 text-indigo-600" />;
    if (type.includes('RESEARCH') || type.includes('PAPER')) return <GraduationCap className="h-4 w-4 text-purple-600" />;
    if (type.includes('CERTIFICATE') || type.includes('ACHIEVEMENT')) return <Award className="h-4 w-4 text-rose-600" />;
    return <Activity className="h-4 w-4 text-slate-600" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E7EC] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/profile')}
            className="p-2 text-[#475467] hover:text-[#101828] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#101828]">Learning History & Activity Log</h1>
            <p className="text-xs text-[#667085]">
              Chronological log of verified courses, coding problems, quizzes, and research milestones.
            </p>
          </div>
        </div>

        <button
          onClick={loadActivities}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#475467] hover:text-[#101828] bg-white border border-[#E4E7EC] rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities by title or keyword..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        {/* Type Select */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500 hidden sm:block" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="ALL">All Activity Types</option>
            <option value="COURSE_LESSON_COMPLETED">Course Lessons</option>
            <option value="QUIZ_COMPLETED">Quizzes</option>
            <option value="CODING_PROBLEM_SOLVED">Coding Problems</option>
            <option value="DSA_PROBLEM_SOLVED">DSA Challenges</option>
            <option value="PAPER_ANALYZED">Research Papers</option>
            <option value="PROJECT_CREATED">Projects</option>
            <option value="GITHUB_CONNECTED">GitHub Actions</option>
            <option value="CERTIFICATE_EARNED">Certificates</option>
          </select>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#667085] space-y-2">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto text-[#2563EB]" />
            <p>Loading activity history...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#667085]">
            <Activity className="h-8 w-8 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No activity recorded yet</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Start studying a course lesson, solve a coding problem, or analyze a paper to populate your history.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-start gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                  {getActivityIcon(item.activity_type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-xs font-semibold text-[#101828] truncate">{item.title}</h4>
                    <span className="text-[10px] text-[#98A2B3] tabular-nums shrink-0">
                      {new Date(item.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-[#475467] font-medium">
                      {item.activity_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-[#667085]">
                      Entity: <span className="font-mono text-slate-700">{item.entity_type}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
