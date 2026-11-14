import * as React from 'react';
import { ArrowLeft, Award, CheckCircle2, Lock, Sparkles, Filter } from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import { toast } from 'sonner';

export function ProfileAchievementsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [achievements, setAchievements] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedCategory, setSelectedCategory] = React.useState('ALL');

  React.useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const data = await communityProfileApi.getAchievements();
      setAchievements(data);
    } catch {
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const filtered = achievements.filter((ach) => {
    if (selectedCategory === 'ALL') return true;
    return ach.category === selectedCategory;
  });

  const earnedCount = achievements.filter((a) => a.is_earned).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/profile')}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Student Achievements</h1>
            <p className="text-xs text-slate-500">
              Deterministic milestone badges awarded strictly for verified learning and technical accomplishments.
            </p>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
          <Award className="h-4 w-4 text-purple-600" />
          <span className="text-xs font-bold text-purple-900">
            {earnedCount} / {achievements.length} Badges Earned
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'LEARNING', 'CODING', 'RESEARCH', 'COMMUNITY'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat === 'ALL' ? 'All Badges' : cat}
          </button>
        ))}
      </div>

      {/* Grid of Achievements */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          No achievements in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                item.is_earned
                  ? 'bg-white border-purple-200 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                  {item.icon || '🏅'}
                </span>
                {item.is_earned ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Unlocked</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                    <Lock className="h-3 w-3" />
                    <span>Locked</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">{item.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-mono text-[10px]">
                  Criteria: {item.criteria.threshold} {item.criteria.type.replace(/_/g, ' ')}
                </span>
                {item.is_earned && item.earned_at && (
                  <span className="text-purple-700 font-medium">
                    {new Date(item.earned_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
