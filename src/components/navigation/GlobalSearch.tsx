import * as React from 'react';
import { Search, BookOpen, FileText, Files, Binary, Code2, Hammer, Bot, X, ArrowRight, Loader2, HelpCircle, History, CornerDownLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { useUiStore } from '../../store/uiStore';
import { useSearch } from '../../hooks/useSearch';
import { SearchType } from '../../api/search';
import { searchNavPages, navItemByHref, findSectionForItem, type NavItem } from './navConfig';
import { useWorkspacePrefs } from '../../store/workspacePrefsStore';
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
  const recentHrefs = useWorkspacePrefs((st) => st.recent);
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Pages from the sidebar match instantly; with an empty box the student's recent pages are offered.
  const pageMatches: { item: NavItem; group: string }[] = React.useMemo(() => {
    if (query.trim()) {
      return selectedCategory === 'all' ? searchNavPages(query, 5).map((m) => ({ item: m.item, group: m.section.title })) : [];
    }
    return recentHrefs
      .map(navItemByHref)
      .filter((i): i is NavItem => Boolean(i))
      .map((item) => ({ item, group: findSectionForItem(item)?.title ?? '' }));
  }, [query, selectedCategory, recentHrefs]);
  const contentItems = query.trim() && !isLoading ? data?.items ?? [] : [];
  const options = React.useMemo(
    () => [...pageMatches.map((p) => p.item.href), ...contentItems.map((c) => c.url)],
    [pageMatches, contentItems]
  );

  React.useEffect(() => setActive(0), [query, selectedCategory]);
  React.useEffect(() => {
    listRef.current?.querySelector(`[data-option-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!options.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a - 1 + options.length) % options.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(options[Math.min(active, options.length - 1)]);
    }
  };
  const optionId = (i: number) => `search-option-${i}`;

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
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl [&>button:last-child]:hidden">
        <DialogTitle className="sr-only">Search pages and content</DialogTitle>
        <DialogDescription className="sr-only">
          Search across B.Tech courses, engineering lecture notes, PDF textbooks, coding exercises, and projects.
        </DialogDescription>

        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-white">
          <Search className="h-4 w-4 text-slate-400 mr-3 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Jump to a page, or search courses, notes, documents…"
            aria-label="Search pages and content"
            role="combobox"
            aria-expanded={options.length > 0}
            aria-controls="global-search-results"
            aria-activedescendant={options.length ? optionId(active) : undefined}
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-200 bg-slate-50/70 overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              aria-pressed={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 cursor-pointer',
                selectedCategory === cat.id
                  ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results: matching pages first, then content from the search API */}
        <div ref={listRef} id="global-search-results" role="listbox" aria-label="Search results" className="max-h-[420px] overflow-y-auto p-2">
          {pageMatches.length > 0 && (
            <div role="group" aria-label={query.trim() ? 'Pages' : 'Recent pages'} className="mb-1">
              <p className="flex items-center gap-1.5 px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                {query.trim() ? 'Pages' : (<><History className="h-3 w-3" aria-hidden="true" /> Recent pages</>)}
              </p>
              {pageMatches.map(({ item, group }, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.href}
                    id={optionId(i)}
                    role="option"
                    aria-selected={active === i}
                    data-option-index={i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => handleSelect(item.href)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm',
                      active === i ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <Icon className={cn('h-4 w-4 shrink-0', active === i ? 'text-blue-600' : 'text-slate-400')} />
                    <span className="flex-1 truncate font-medium">{item.name}</span>
                    <span className="shrink-0 text-[11px] text-slate-500">{group}</span>
                    {active === i && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-blue-500" aria-hidden="true" />}
                  </div>
                );
              })}
            </div>
          )}

          {query.trim().length === 0 ? (
            pageMatches.length === 0 && (
              <div className="py-10 text-center text-xs text-slate-500">
                Type a page name like <span className="font-semibold text-slate-700">"Flashcards"</span> or a topic like{' '}
                <span className="font-semibold text-slate-700">"Operating Systems"</span>.
              </div>
            )
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8 text-slate-400 gap-2 text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span>Searching your workspace…</span>
            </div>
          ) : contentItems.length > 0 ? (
            <div role="group" aria-label="Content">
              <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">Content</p>
              {contentItems.map((item, k) => {
                const i = pageMatches.length + k;
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    id={optionId(i)}
                    role="option"
                    aria-selected={active === i}
                    data-option-index={i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => handleSelect(item.url)}
                    className={cn(
                      'group flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors',
                      active === i ? 'bg-blue-50' : 'hover:bg-slate-50'
                    )}
                  >
                    <div className="mt-0.5 shrink-0 rounded-lg bg-slate-100/80 p-2">{getIcon(item.type)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={cn('truncate text-xs font-semibold', active === i ? 'text-blue-700' : 'text-slate-900')}>{item.title}</h4>
                        <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium capitalize text-slate-600">{item.type}</span>
                      </div>
                      {item.description && <p className="mt-0.5 line-clamp-1 text-[11px] leading-relaxed text-slate-600">{item.description}</p>}
                      {item.tags.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {item.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="rounded bg-slate-100 px-1.5 text-[10px] text-slate-500">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 self-center text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600" />
                  </div>
                );
              })}
            </div>
          ) : (
            pageMatches.length === 0 && (
              <div className="py-10 text-center text-xs text-slate-500">No pages or content match "{query}".</div>
            )
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500">
          <span>↑ ↓ to move, Enter to open, Esc to close</span>
          <span>Press ? for all shortcuts</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
