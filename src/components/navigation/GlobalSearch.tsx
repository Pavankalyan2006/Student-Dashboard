import * as React from 'react';
import { Search, BookOpen, FileText, Files, Binary, Code2, Hammer, Bot, Users, X, ArrowRight, Loader2, HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { useUiStore } from '../../store/uiStore';
import { useSearch } from '../../hooks/useSearch';
import { SearchType, SearchResultItem } from '../../api/search';
import { cn } from '../../lib/utils';

export function GlobalSearch({ onNavigate }: { onNavigate: (url: string) => void }) {
  const { globalSearchOpen, setGlobalSearchOpen, searchInitialQuery } = useUiStore();
  const [query, setQuery] = React.useState(searchInitialQuery || '');
  const [selectedCategory, setSelectedCategory] = React.useState<SearchType>('all');

  // Sync initial query
  React.useEffect(() => {
    if (globalSearchOpen && searchInitialQuery) {
      setQuery(searchInitialQuery);
    }
  }, [globalSearchOpen, searchInitialQuery]);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setGlobalSearchOpen]);

  const { data, isLoading } = useSearch(query, selectedCategory, 1, 10);

  const categories: { id: SearchType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'courses', label: 'Courses' },
    { id: 'notes', label: 'Notes' },
    { id: 'documents', label: 'Documents' },
    { id: 'doubts', label: 'Doubts' },
    { id: 'flashcards', label: 'Flashcards' },
    { id: 'labs', label: 'Labs' },
    { id: 'knowledge', label: 'Knowledge' },
    { id: 'applications', label: 'Applications' },
    { id: 'dsa', label: 'DSA' },
    { id: 'coding', label: 'Coding' },
    { id: 'projects', label: 'Projects' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'courses': return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'notes': return <FileText className="h-4 w-4 text-emerald-600" />;
      case 'documents': return <Files className="h-4 w-4 text-purple-600" />;
      case 'doubts': return <HelpCircle className="h-4 w-4 text-purple-600" />;
      case 'flashcards': return <BookOpen className="h-4 w-4 text-amber-600" />;
      case 'labs': return <Code2 className="h-4 w-4 text-blue-600" />;
      case 'knowledge': return <BookOpen className="h-4 w-4 text-indigo-600" />;
      case 'applications': return <Hammer className="h-4 w-4 text-emerald-600" />;
      case 'dsa': return <Binary className="h-4 w-4 text-amber-600" />;
      case 'coding': return <Code2 className="h-4 w-4 text-teal-600" />;
      case 'projects': return <Hammer className="h-4 w-4 text-indigo-600" />;
      case 'ai': return <Bot className="h-4 w-4 text-blue-600" />;
      default: return <Search className="h-4 w-4 text-slate-400" />;
    }
  };

  const handleSelect = (url: string) => {
    setGlobalSearchOpen(false);
    onNavigate(url);
  };

  return (
    <Dialog open={globalSearchOpen} onOpenChange={setGlobalSearchOpen}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden rounded-xl border border-[#E4E7EC] bg-white shadow-2xl">
        <DialogTitle className="sr-only">Search Curriculum & AI Workspace</DialogTitle>
        <DialogDescription className="sr-only">
          Search across B.Tech courses, engineering lecture notes, PDF textbooks, coding exercises, and projects.
        </DialogDescription>

        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E4E7EC] bg-white">
          <Search className="h-4 w-4 text-slate-400 mr-3 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search B.Tech courses, algorithms, notes, documents..."
            className="w-full text-sm text-[#101828] placeholder:text-[#98A2B3] focus:outline-none bg-transparent"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#E4E7EC] bg-slate-50/70 overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 cursor-pointer',
                selectedCategory === cat.id
                  ? 'bg-white text-[#2563EB] shadow-2xs font-semibold'
                  : 'text-[#475467] hover:text-[#101828]'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
              <span>Searching curriculum index...</span>
            </div>
          ) : query.trim().length === 0 ? (
            <div className="py-10 text-center text-xs text-[#667085]">
              Type a topic like <span className="font-semibold text-slate-700">"Algorithms"</span>,{' '}
              <span className="font-semibold text-slate-700">"Operating Systems"</span>, or{' '}
              <span className="font-semibold text-slate-700">"AVL Trees"</span>.
            </div>
          ) : data?.items && data.items.length > 0 ? (
            data.items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.url)}
                className="group flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-slate-100/80 shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-[#101828] group-hover:text-[#2563EB] transition-colors truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#475467] line-clamp-1 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-[10px] text-[#667085] bg-slate-100 px-1.5 py-0.2 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all shrink-0 self-center" />
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-xs text-[#667085]">
              No curriculum results found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#E4E7EC] bg-slate-50 text-[11px] text-[#667085]">
          <span>Use arrows to navigate, Esc to close</span>
          <span className="font-mono text-[10px]">API: GET /api/v1/search</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
