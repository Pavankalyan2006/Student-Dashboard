import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { researchApi } from '../api/researchApi';
import { ResearchPaper, ResearchPaperAnalysis, PaperComparisonMatrix, PaperAnswer } from '../types';
import { documentsApi } from '../../documents/api/documentsApi';
import { useImportPaper } from '../hooks/useResearch';
import {
  Search,
  BookOpen,
  Plus,
  ExternalLink,
  Sparkles,
  Layers,
  FileText,
  Filter,
  Check,
  CheckCircle2,
  X,
  FileCode,
  Tag,
  Calendar,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';

interface PapersPanelProps {
  projectId: string;
  papers: ResearchPaper[];
}

/** The student's own reading notes and status for a saved paper, stored on the server. */
const PaperNotes: React.FC<{ paper: ResearchPaper; projectId: string }> = ({ paper, projectId }) => {
  const qc = useQueryClient();
  const [notes, setNotes] = useState(paper.notes || '');
  const [status, setStatus] = useState<'TO_READ' | 'READING' | 'READ'>(paper.reading_status || 'TO_READ');
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      await researchApi.updatePaperNotes(paper.id, { notes, reading_status: status });
      await qc.invalidateQueries({ queryKey: ['research-papers', projectId] });
      toast.success('Notes saved');
    } catch (err: any) {
      toast.error(err?.message || 'Could not save notes');
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!window.confirm('Remove this paper from the project? Its notes will be deleted too.')) return;
    try {
      await researchApi.deletePaper(paper.id);
      await qc.invalidateQueries({ queryKey: ['research-papers', projectId] });
      toast.success('Paper removed');
    } catch (err: any) {
      toast.error(err?.message || 'Could not remove the paper');
    }
  };
  return (
    <div className="pt-3 border-t border-slate-100 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`status-${paper.id}`} className="text-xs font-semibold text-slate-700">Reading status</label>
        <select id={`status-${paper.id}`} value={status} onChange={(e) => setStatus(e.target.value as any)} className="text-xs border border-slate-200 rounded-lg px-2 py-1">
          <option value="TO_READ">To read</option>
          <option value="READING">Reading</option>
          <option value="READ">Read</option>
        </select>
      </div>
      <label htmlFor={`notes-${paper.id}`} className="sr-only">Your notes</label>
      <textarea id={`notes-${paper.id}`} value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={20000}
        placeholder="Your notes on this paper" className="w-full text-xs border border-slate-200 rounded-lg p-2" />
      <div className="flex gap-2">
        <button onClick={save} disabled={saving} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white disabled:opacity-50 cursor-pointer">
          {saving ? 'Saving...' : 'Save notes'}
        </button>
        <button onClick={remove} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-rose-600 hover:bg-rose-50 cursor-pointer">
          Remove paper
        </button>
      </div>
    </div>
  );
};

const FIELD_LABELS: Record<string, string> = {
  title: 'Title', authors: 'Authors', abstract: 'Abstract', publication_year: 'Year', venue: 'Venue', doi: 'DOI', keywords: 'Keywords', references: 'References',
};
const DOI_CHECK_LABEL: Record<string, string> = {
  MATCHED: 'DOI matched on OpenAlex', NOT_FOUND: 'DOI not found on OpenAlex', TITLE_MISMATCH: 'DOI points to a different title',
  UNREACHABLE: 'OpenAlex could not be reached', NO_DOI_FOUND: 'No DOI in the file', NOT_CHECKED: 'DOI not checked',
};

/** Phase 6: where each detail of an imported paper came from, and a form to correct it. */
const PaperProvenance: React.FC<{ paper: ResearchPaper; projectId: string }> = ({ paper, projectId }) => {
  const qc = useQueryClient();
  const meta: Record<string, any> = paper.metadata || {};
  const prov: Record<string, any> = meta.field_provenance || {};
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: paper.title, authors: paper.authors.join('; '), publication_year: paper.publication_year ? String(paper.publication_year) : '', venue: paper.venue || '', doi: paper.doi || '',
  });
  const save = useMutation({
    mutationFn: () => researchApi.updatePaperMetadata(paper.id, {
      title: form.title, authors: form.authors.split(';').map((a) => a.trim()).filter(Boolean),
      publication_year: form.publication_year ? Number(form.publication_year) : null, venue: form.venue, doi: form.doi,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['research-papers', projectId] }); setEditing(false); toast.success('Paper details saved'); },
    onError: (e: any) => toast.error(e.message || 'Could not save the details'),
  });
  if (!Object.keys(prov).length && paper.provider !== 'PDF_UPLOAD') return null;
  const needsCheck = Object.entries(prov).filter(([, v]) => v?.needs_check).map(([k]) => FIELD_LABELS[k] || k);
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-bold text-slate-700">Where these details came from</span>
        <button onClick={() => setEditing((v) => !v)} className="text-indigo-700 font-bold hover:underline">{editing ? 'Cancel' : 'Correct details'}</button>
      </div>
      {needsCheck.length > 0 && (
        <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
          Read from the PDF layout, so please check: {needsCheck.join(', ')}.
        </p>
      )}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
        {Object.keys(FIELD_LABELS).map((k) => {
          const v = prov[k];
          return (
            <li key={k} className="text-slate-600">
              <span className="font-semibold text-slate-700">{FIELD_LABELS[k]}:</span>{' '}
              {v ? `${v.source === 'OPENALEX_DOI' ? 'OpenAlex (DOI match)' : v.source === 'STUDENT_EDITED' ? 'entered by you' : `from the file${v.page ? `, page ${v.page}` : ''}`}` : 'not found, left empty'}
            </li>
          );
        })}
      </ul>
      {meta.doi_check?.status && <p className="text-slate-500">{meta.doi_check.note || DOI_CHECK_LABEL[meta.doi_check.status] || meta.doi_check.status}</p>}
      {Array.isArray(meta.keywords) && meta.keywords.length > 0 && <p className="text-slate-600">Keywords: {meta.keywords.join(', ')}</p>}
      {Array.isArray(meta.references) && meta.references.length > 0 && (
        <details>
          <summary className="cursor-pointer text-slate-700 font-semibold">{meta.references.length} references found in the file</summary>
          <ol className="list-decimal pl-5 mt-1 space-y-0.5 text-slate-600 max-h-48 overflow-y-auto">
            {meta.references.map((r: string, i: number) => <li key={i}>{r}</li>)}
          </ol>
        </details>
      )}
      {editing && (
        <form className="space-y-2 pt-2 border-t border-slate-200" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          {([['title', 'Title'], ['authors', 'Authors (separate with ;)'], ['publication_year', 'Year'], ['venue', 'Venue'], ['doi', 'DOI']] as const).map(([k, label]) => (
            <label key={k} className="block">
              <span className="block text-[10px] font-bold uppercase text-slate-500">{label}</span>
              <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="w-full border border-slate-200 rounded-lg px-2 py-1 bg-white" />
            </label>
          ))}
          <button type="submit" disabled={save.isPending} className="px-3 py-1.5 rounded-lg font-bold bg-slate-900 text-white disabled:opacity-50">{save.isPending ? 'Saving…' : 'Save details'}</button>
        </form>
      )}
    </div>
  );
};

/** Phase 6: ask one paper a question. Source passages and the AI's explanation are shown apart. */
const AskPaper: React.FC<{ paper: ResearchPaper }> = ({ paper }) => {
  const [question, setQuestion] = useState('');
  const ask = useMutation({
    mutationFn: () => researchApi.askPaper(paper.id, question),
    onError: (e: any) => toast.error(e.message || 'Could not answer'),
  });
  const a: PaperAnswer | undefined = ask.data;
  return (
    <div className="pt-3 border-t border-slate-100 space-y-2">
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (question.trim()) ask.mutate(); }}>
        <label htmlFor={`ask-${paper.id}`} className="sr-only">Ask this paper</label>
        <input id={`ask-${paper.id}`} value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={1000}
          placeholder={paper.document_id ? 'Ask this paper (answers cite page numbers)' : 'Ask about this paper (answers use the abstract only)'}
          className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5" />
        <button type="submit" disabled={!question.trim() || ask.isPending} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white disabled:opacity-50">
          {ask.isPending ? 'Asking…' : 'Ask'}
        </button>
      </form>
      {a && (
        <div className="space-y-2 text-xs" aria-live="polite">
          <p className="text-slate-500">{a.basis_note}</p>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">From the paper</div>
            {a.source_passages.length === 0 ? (
              <p className="text-emerald-900">No supporting passage was found in the {a.basis === 'FULL_TEXT' ? 'file' : 'abstract'}.</p>
            ) : (
              a.source_passages.map((sp, i) => (
                <blockquote key={i} className="text-emerald-950 border-l-2 border-emerald-400 pl-2">
                  “{sp.text}”{sp.page ? <span className="text-emerald-700 font-semibold"> (page {sp.page})</span> : null}
                </blockquote>
              ))
            )}
          </div>
          <div className="rounded-lg border border-violet-200 bg-violet-50 p-2.5 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-violet-800">AI interpretation</div>
            <p className="text-violet-950 whitespace-pre-wrap">{a.interpretation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const PapersPanel: React.FC<PapersPanelProps> = ({ projectId, papers }) => {
  const qc = useQueryClient();
  const importMutation = useImportPaper(projectId);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [venueFilter, setVenueFilter] = useState('');
  const [yearMin, setYearMin] = useState<number | undefined>();
  const [searchResults, setSearchResults] = useState<ResearchPaper[]>([]);
  const [searchSource, setSearchSource] = useState<{ source?: string; note?: string; error?: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Analysis state
  const [selectedPaperForAnalysis, setSelectedPaperForAnalysis] = useState<string | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<ResearchPaperAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Summarize state
  const [summaryMode, setSummaryMode] = useState<'simple' | 'technical'>('simple');
  const [paperSummary, setPaperSummary] = useState<string | null>(null);

  // Comparison state
  const [selectedPaperIdsForCompare, setSelectedPaperIdsForCompare] = useState<string[]>([]);
  const [comparisonMatrix, setComparisonMatrix] = useState<PaperComparisonMatrix | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  // PDF import modal state
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [documentIdInput, setDocumentIdInput] = useState('');
  const docsQuery = useQuery({ queryKey: ['research-import-docs'], queryFn: () => documentsApi.getDocuments({ limit: 100 } as any), enabled: showPdfModal });
  const readyDocs = (docsQuery.data?.items || []).filter((d: any) => d.status === 'READY');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await researchApi.searchPapers(projectId, {
        query: searchQuery.trim(),
        venue: venueFilter.trim() || undefined,
        year_min: yearMin,
      });
      setSearchResults(res.papers);
      setSearchSource({ source: res.source, note: res.source_note, error: res.live_error });
      if (res.papers.length === 0) {
        toast.info('No papers found for this search. Try broader keywords.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAnalyze = async (paperId: string) => {
    setSelectedPaperForAnalysis(paperId);
    setIsAnalyzing(true);
    setActiveAnalysis(null);
    setPaperSummary(null);

    try {
      const analysis = await researchApi.analyzePaper(paperId);
      setActiveAnalysis(analysis);
    } catch (err: any) {
      toast.error(err.message || 'Failed to analyze paper');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSummarize = async (paperId: string, mode: 'simple' | 'technical') => {
    try {
      const res = await researchApi.summarizePaper(paperId, mode);
      setPaperSummary(res.summary);
      setSummaryMode(mode);
    } catch (err: any) {
      toast.error(err.message || 'Summary failed');
    }
  };

  const handleToggleComparePaper = (id: string) => {
    if (selectedPaperIdsForCompare.includes(id)) {
      setSelectedPaperIdsForCompare(selectedPaperIdsForCompare.filter((pid) => pid !== id));
    } else {
      setSelectedPaperIdsForCompare([...selectedPaperIdsForCompare, id]);
    }
  };

  const handleRunComparison = async () => {
    if (selectedPaperIdsForCompare.length < 2) {
      toast.error('Select at least 2 papers to compare');
      return;
    }

    setIsComparing(true);
    try {
      const matrix = await researchApi.comparePapers(selectedPaperIdsForCompare);
      setComparisonMatrix(matrix);
    } catch (err: any) {
      toast.error(err.message || 'Comparison failed');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar: Search & Add Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Research Papers & Literature</h2>
          <p className="text-xs text-slate-500">
            Discover peer-reviewed papers or import uploaded PDFs from Document AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {papers.length >= 2 && (
            <button
              onClick={handleRunComparison}
              disabled={selectedPaperIdsForCompare.length < 2 || isComparing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              Compare ({selectedPaperIdsForCompare.length}) Papers
            </button>
          )}

          <button
            onClick={() => setShowPdfModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Import PDF Document
          </button>
        </div>
      </div>

      {/* Paper Search Box */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search open academic indices (e.g. transformers, distributed consensus, neural networks)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSearching ? 'Searching...' : 'Search Papers'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="font-medium text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </span>
            <input
              type="text"
              placeholder="Venue (e.g. NeurIPS, ICLR)"
              value={venueFilter}
              onChange={(e) => setVenueFilter(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            <input
              type="number"
              placeholder="Min Year (e.g. 2017)"
              value={yearMin || ''}
              onChange={(e) => setYearMin(e.target.value ? Number(e.target.value) : undefined)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs w-28"
            />
          </div>
        </form>

        {/* Search Results Drawer */}
        {searchResults.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                {searchSource?.source === 'LIVE' ? 'OpenAlex results' : 'Curated list results'} ({searchResults.length})
              </span>
              <button
                onClick={() => setSearchResults([])}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Close Search Results
              </button>
            </div>

            {searchSource?.source === 'CURATED' && (
              <p role="status" className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
                {searchSource.error ? `${searchSource.error} ` : ''}{searchSource.note}
              </p>
            )}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {searchResults.map((p) => {
                const isSaved = papers.some((saved) => saved.title.toLowerCase() === p.title.toLowerCase());
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {p.authors.join(', ')} · <span className="font-medium text-indigo-700">{p.venue}</span> ({p.publication_year})
                        </p>
                      </div>

                      <button
                        onClick={() => importMutation.mutate({ paper: p })}
                        disabled={isSaved || importMutation.isPending}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isSaved
                            ? 'bg-emerald-50 text-emerald-700 cursor-not-allowed border border-emerald-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs cursor-pointer'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Added to Research
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" /> Add to Project
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{p.abstract}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Saved Papers in this Project */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Papers Saved in Project ({papers.length})</h3>

        {papers.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No papers saved yet</h4>
            <p className="text-xs text-slate-500">Search academic indices above or import an existing PDF document.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {papers.map((p) => {
              const isSelectedForCompare = selectedPaperIdsForCompare.includes(p.id);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all space-y-3 shadow-2xs"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {p.provider}
                        </span>
                        {p.doi && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            DOI: {p.doi}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-slate-900 leading-snug">{p.title}</h4>
                      <p className="text-xs text-slate-500">
                        {p.authors.length ? p.authors.join(', ') : 'Authors not recorded'}
                        {p.venue ? <> · <span className="font-semibold text-slate-800">{p.venue}</span></> : null}
                        {' '}({p.publication_year || 'year not recorded'})
                        {p.provider !== 'PDF_UPLOAD' && p.provider !== 'MANUAL' ? ` · ${p.citation_count} citations` : ''}
                      </p>
                    </div>

                    {/* Paper Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleComparePaper(p.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          isSelectedForCompare
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isSelectedForCompare ? '✓ Selected' : 'Select to Compare'}
                      </button>

                      <button
                        onClick={() => handleAnalyze(p.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Analyze Paper
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{p.abstract || 'No abstract available for this paper.'}</p>
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-indigo-600 hover:underline">
                      Open source page
                    </a>
                  )}
                  <PaperProvenance paper={p} projectId={projectId} />
                  <AskPaper paper={p} />
                  <PaperNotes paper={p} projectId={projectId} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Paper Analysis Modal */}
      {selectedPaperForAnalysis && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">AI Structured Paper Analysis</h3>
              </div>
              <button
                onClick={() => setSelectedPaperForAnalysis(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Summary Mode Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <span className="font-bold text-indigo-950">AI Executive Summary</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSummarize(selectedPaperForAnalysis, 'simple')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      summaryMode === 'simple' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700'
                    }`}
                  >
                    Intuitive (Simple)
                  </button>
                  <button
                    onClick={() => handleSummarize(selectedPaperForAnalysis, 'technical')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      summaryMode === 'technical' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700'
                    }`}
                  >
                    Rigorous (Technical)
                  </button>
                </div>
              </div>

              {paperSummary && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Summary ({summaryMode})
                  </div>
                  <p className="text-slate-700 leading-relaxed">{paperSummary}</p>
                </div>
              )}

              {isAnalyzing ? (
                <div className="py-16 text-center text-slate-400">
                  Executing multi-pass academic paper extraction...
                </div>
              ) : activeAnalysis ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      Core Research Problem
                    </div>
                    <p className="text-slate-800 leading-relaxed">{activeAnalysis.research_problem}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Methodology</div>
                      <p className="text-slate-800">{activeAnalysis.methodology}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Dataset / Benchmark</div>
                      <p className="text-slate-800">{activeAnalysis.dataset}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Evaluation Results</div>
                    <p className="text-slate-800">{activeAnalysis.results}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
                    <div className="font-bold text-amber-900 uppercase tracking-wider text-[10px]">
                      Documented Limitations
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-amber-950">
                      {activeAnalysis.limitations.map((lim, i) => (
                        <li key={i}>{lim}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                    <div className="font-bold text-emerald-900 uppercase tracking-wider text-[10px]">
                      Key Contributions
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-emerald-950">
                      {activeAnalysis.contributions.map((con, i) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Standardized Citation */}
                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      APA Citation
                    </div>
                    <p className="font-mono text-slate-800 select-all">{activeAnalysis.citation_information.apa}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Comparison Matrix Modal */}
      {comparisonMatrix && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Multi-Paper Comparison Matrix</h3>
              </div>
              <button
                onClick={() => setComparisonMatrix(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-200 text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold">
                      <th className="p-3 border border-slate-200">Paper</th>
                      <th className="p-3 border border-slate-200">Year</th>
                      <th className="p-3 border border-slate-200">Methodology</th>
                      <th className="p-3 border border-slate-200">Dataset</th>
                      <th className="p-3 border border-slate-200">Results</th>
                      <th className="p-3 border border-slate-200">Limitations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {comparisonMatrix.rows.map((row) => (
                      <tr key={row.paper_id} className="hover:bg-slate-50">
                        <td className="p-3 border border-slate-200 font-bold max-w-[180px]">{row.paper_title}</td>
                        <td className="p-3 border border-slate-200">{row.year}</td>
                        <td className="p-3 border border-slate-200">{row.methodology}</td>
                        <td className="p-3 border border-slate-200">{row.dataset}</td>
                        <td className="p-3 border border-slate-200">{row.results}</td>
                        <td className="p-3 border border-slate-200 text-amber-900">{row.limitations}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Comparative Insights */}
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <div className="font-bold text-indigo-950 uppercase tracking-wider text-[10px]">
                  Methodological Similarities & Research Trends
                </div>
                <ul className="list-disc pl-4 space-y-1 text-indigo-900">
                  {comparisonMatrix.comparative_analysis.similar_approaches.map((sim, i) => (
                    <li key={i}>{sim}</li>
                  ))}
                  {comparisonMatrix.comparative_analysis.research_trends.map((rt, i) => (
                    <li key={i}>{rt}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Document Import Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Import PDF from Document AI</h3>
              <button onClick={() => setShowPdfModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Pick a PDF you uploaded in Documents. Title, authors, abstract, year, DOI, keywords and references are read from its text, with the page each came from. Anything not found is left empty for you to fill in.
            </p>

            <label htmlFor="research-import-doc" className="sr-only">Uploaded document</label>
            <select
              id="research-import-doc"
              value={documentIdInput}
              onChange={(e) => setDocumentIdInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">{docsQuery.isLoading ? 'Loading your documents…' : readyDocs.length ? 'Choose a document' : 'No processed documents yet'}</option>
              {readyDocs.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
            {!docsQuery.isLoading && readyDocs.length === 0 && (
              <a href="/documents" className="text-xs text-indigo-700 font-semibold hover:underline">Upload a PDF in Documents</a>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!documentIdInput.trim()) return;
                  await importMutation.mutateAsync({ document_id: documentIdInput.trim() });
                  setShowPdfModal(false);
                  setDocumentIdInput('');
                }}
                disabled={importMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
              >
                Import Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
