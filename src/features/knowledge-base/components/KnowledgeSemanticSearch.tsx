// src/features/knowledge-base/components/KnowledgeSemanticSearch.tsx
// Semantic vector search workspace with matching passages, similarity scores, and citations

import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Copy,
  Check,
  Folder,
  SlidersHorizontal,
} from 'lucide-react';
import { KnowledgeSearchResult, KnowledgeCollection, KnowledgeSearchMatch } from '../types/knowledgeBaseTypes';
import { knowledgeBaseApi } from '../api/knowledgeBaseApi';

interface KnowledgeSemanticSearchProps {
  collections: KnowledgeCollection[];
  onAskAiWithContext: (question: string, docId?: string) => void;
}

export const KnowledgeSemanticSearch: React.FC<KnowledgeSemanticSearchProps> = ({
  collections,
  onAskAiWithContext,
}) => {
  const [query, setQuery] = useState('');
  const [collectionId, setCollectionId] = useState<string>('');
  const [results, setResults] = useState<KnowledgeSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await knowledgeBaseApi.search({
        query: query.trim(),
        collection_id: collectionId || undefined,
        limit: 12,
      });
      setResults(res);
    } catch (err) {
      console.error('Semantic search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (chunkId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(chunkId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const SUGGESTED_QUERIES = [
    'Virtual memory page replacement algorithms',
    'Dijkstra shortest path time complexity',
    'Deadlock prevention vs avoidance',
    'ACID properties in distributed databases',
    'Convolutional neural network layer operations',
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Search Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Search className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-white">Search your documents</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Find passages in your indexed notes and textbooks. Matching is by the words they share with your query (a local keyword-vector index, not an AI embedding model), so use the terms your notes use.
        </p>

        {/* Search Bar & Filters */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search concepts, mathematical formulas, theorems, algorithms..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition shadow-lg shadow-indigo-600/25 shrink-0"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400">Filter by Collection:</span>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Collections ({collections.length})</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Suggested Queries */}
        {!results && (
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Try searching for:
            </span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuery(q);
                    // trigger search
                    knowledgeBaseApi
                      .search({ query: q, collection_id: collectionId || undefined, limit: 12 })
                      .then(setResults);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs transition"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Found <strong className="text-white">{results.total_matches}</strong> matching passages for "
              {results.query}"
            </span>
          </div>

          {/* Matching Collections if any */}
          {results.collections && results.collections.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Matching Collections
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.collections.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60"
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: c.color || '#3B82F6' }}
                    >
                      <Folder className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{c.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {c.document_count || 0} documents
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passage Matches */}
          {results.matches.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              <p className="text-sm">No exact passages matched your query.</p>
              <p className="text-xs mt-1 text-slate-500">
                Try broader keywords or ask the AI tutor to synthesize concepts across your materials.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {results.matches.map((match) => {
                const scorePercent = Math.round(match.score * 100);
                return (
                  <div
                    key={match.chunk_id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition shadow-sm space-y-2.5"
                  >
                    {/* Source Doc & Page */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-white">{match.document_title}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          Page {match.page_number}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            scorePercent >= 80
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}
                        >
                          {scorePercent}% match
                        </span>

                        <button
                          onClick={() => handleCopy(match.chunk_id, match.snippet)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Copy snippet"
                        >
                          {copiedId === match.chunk_id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Snippet Text */}
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                      "{match.snippet}"
                    </p>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() =>
                          onAskAiWithContext(`Explain this passage: "${match.snippet.substring(0, 120)}..."`, match.document_id)
                        }
                        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Ask AI about this passage</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
