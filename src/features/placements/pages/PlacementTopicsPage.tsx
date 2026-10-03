import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { placementsApi } from '../api/placementsApi';
import { PlacementTopicCard } from '../components/PlacementTopicCard';
import { PlacementCategory } from '../types/placement';
import { Search, Filter, BookOpen } from 'lucide-react';

interface Props {
  initialCategory?: string;
  onNavigate: (path: string) => void;
}

const CATEGORIES: { label: string; value: PlacementCategory | 'ALL' }[] = [
  { label: 'All Topics', value: 'ALL' },
  { label: 'Quantitative Aptitude', value: 'APTITUDE' },
  { label: 'Logical Reasoning', value: 'LOGICAL_REASONING' },
  { label: 'Verbal Ability', value: 'VERBAL' },
  { label: 'DBMS & SQL', value: 'DBMS' },
  { label: 'Operating Systems', value: 'OPERATING_SYSTEMS' },
  { label: 'Computer Networks', value: 'COMPUTER_NETWORKS' },
  { label: 'OOP & System Design', value: 'OOP' },
  { label: 'HR & Behavioral', value: 'HR' },
];

export const PlacementTopicsPage: React.FC<Props> = ({ initialCategory, onNavigate }) => {
  const [selectedCat, setSelectedCat] = useState<string>(initialCategory || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['placement-topics', selectedCat],
    queryFn: () => placementsApi.getTopics(selectedCat === 'ALL' ? undefined : selectedCat),
  });

  const filteredTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <BookOpen className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Placement Preparation Topics</h1>
          </div>
          <p className="text-xs text-slate-500">
            Curated B.Tech placement curriculum: Quantitative aptitude, CS core fundamentals, and HR frameworks.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search concepts or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCat(cat.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCat === cat.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Topics Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filteredTopics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTopics.map((topic) => (
            <PlacementTopicCard
              key={topic.id}
              topic={topic}
              onSelect={(id) => onNavigate(`/placements/topic/${id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700 mb-1">No Topics Found</h3>
          <p className="text-xs text-slate-500">
            No topics matched your search criteria. Try selecting another category or clearing filters.
          </p>
        </div>
      )}
    </div>
  );
};
