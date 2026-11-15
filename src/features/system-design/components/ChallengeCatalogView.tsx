// src/features/system-design/components/ChallengeCatalogView.tsx
// Catalog of 25 Canonical System Design Challenges with Filters, Benchmarks & Start Actions

import * as React from 'react';
import {
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Users,
  HardDrive,
  Activity,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Cpu,
  ShieldAlert
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { SystemDesignChallenge } from '../types/systemDesign';

interface ChallengeCatalogViewProps {
  challenges: SystemDesignChallenge[];
  onStartChallenge: (challenge: SystemDesignChallenge) => void;
  onViewChallengeDetail: (challenge: SystemDesignChallenge) => void;
}

export function ChallengeCatalogView({
  challenges,
  onStartChallenge,
  onViewChallengeDetail
}: ChallengeCatalogViewProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [expandedChallengeId, setExpandedChallengeId] = React.useState<string | null>(null);

  // Filter categories
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    challenges.forEach(c => set.add(c.category));
    return ['ALL', ...Array.from(set)];
  }, [challenges]);

  const filteredChallenges = React.useMemo(() => {
    return challenges.filter(c => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDiff = selectedDifficulty === 'ALL' || c.difficulty === selectedDifficulty;
      const matchesCat = selectedCategory === 'ALL' || c.category === selectedCategory;
      return matchesSearch && matchesDiff && matchesCat;
    });
  }, [challenges, searchQuery, selectedDifficulty, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Top Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              25 Production Architecture Challenges
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">System Design Challenges Catalog</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Solve real-world scale challenges inspired by Netflix, Uber, TinyURL, WhatsApp, Stripe, and Discord with complete rubrics, capacity benchmarks, and starter components.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">Total Exercises</div>
              <div className="text-2xl font-extrabold text-white">{challenges.length}</div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search challenges by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Difficulty Selector */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Difficulties</option>
              <option value="BEGINNER">Beginner (1-5)</option>
              <option value="INTERMEDIATE">Intermediate (6-16)</option>
              <option value="ADVANCED">Advanced (17-25)</option>
            </select>

            {/* Category Selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChallenges.map(c => {
          const isExpanded = expandedChallengeId === c.id;
          const diffBadge =
            c.difficulty === 'BEGINNER'
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
              : c.difficulty === 'INTERMEDIATE'
              ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800'
              : 'bg-purple-950/60 text-purple-400 border-purple-800';

          return (
            <div
              key={c.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    Challenge #{c.number}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diffBadge}`}>
                    {c.difficulty}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">{c.title}</h3>
                <span className="text-[11px] font-medium text-indigo-400 mt-0.5 block">{c.category}</span>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                {/* Scale Benchmark Stats Strip */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Users className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{c.scale_estimation_benchmarks.daily_active_users}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Activity className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{c.scale_estimation_benchmarks.requests_per_second}</span>
                  </div>
                </div>

                {/* Toggleable Details Accordion */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-3 text-xs animate-in fade-in duration-150">
                    <div>
                      <span className="font-semibold text-slate-300 block mb-1">Functional Scope:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-400 text-[11px]">
                        {c.functional_requirements.slice(0, 3).map((fr, idx) => (
                          <li key={idx}>{fr}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-300 block mb-1">Non-Functional Targets:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-400 text-[11px]">
                        {c.non_functional_requirements.slice(0, 3).map((nfr, idx) => (
                          <li key={idx}>{nfr}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setExpandedChallengeId(isExpanded ? null : c.id)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  {isExpanded ? 'Less' : 'Requirements'}
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <div className="flex items-center gap-1.5">
                  <Button
                    onClick={() => onViewChallengeDetail(c)}
                    size="sm"
                    variant="outline"
                    className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white text-xs h-7 px-2.5"
                  >
                    Details
                  </Button>
                  <Button
                    onClick={() => onStartChallenge(c)}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7 px-3 flex items-center gap-1"
                  >
                    <span>Design</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
