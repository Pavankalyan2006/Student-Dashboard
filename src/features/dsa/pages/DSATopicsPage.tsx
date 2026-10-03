import * as React from 'react';
import { DSATopic, DSATopicCategory, DSADifficulty } from '../types/dsa';
import { dsaApi } from '../api/dsaApi';
import { Search, ArrowRight, ArrowLeft } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

interface DSATopicsPageProps {
  onNavigate?: (path: string) => void;
}

export const DSATopicsPage: React.FC<DSATopicsPageProps> = ({ onNavigate }) => {
  const [topics, setTopics] = React.useState<DSATopic[]>([]);
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>('ALL');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    dsaApi
      .getTopics()
      .then((data) => setTopics(data))
      .finally(() => setLoading(false));
  }, []);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const filteredTopics = topics.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchDiff = selectedDifficulty === 'ALL' || t.difficulty === selectedDifficulty;
    return matchSearch && matchCat && matchDiff;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Back button and title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dsa')}
            className="h-9 w-9 p-0 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Data Structures & Algorithms Curriculum
            </h1>
            <p className="text-xs text-slate-500">
              Explore foundational structures, graph networks, and optimization techniques.
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics by name, concept, or keyword..."
            className="pl-9 text-xs h-9"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'DATA_STRUCTURE', 'ALGORITHM', 'TECHNIQUE'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL'
                ? 'All Categories'
                : cat === 'DATA_STRUCTURE'
                ? 'Data Structures'
                : cat === 'ALGORITHM'
                ? 'Algorithms'
                : 'Techniques'}
            </button>
          ))}
        </div>
      </div>

      {/* Topics Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500">No topics match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              onClick={() => navigate(`/dsa/topic/${topic.id}`)}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {topic.category}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {topic.difficulty}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {topic.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {topic.description}
                </p>

                {/* Concept tags */}
                {topic.concepts && topic.concepts.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {topic.concepts.slice(0, 3).map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-400 font-mono">
                  {topic.algorithms?.length || 0} Algorithms
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open Topic <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
