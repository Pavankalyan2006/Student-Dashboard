// src/features/knowledge-base/components/KnowledgeBookmarksNotesTab.tsx
// Management view for bookmarks and annotations across knowledge base documents

import React, { useState } from 'react';
import { Bookmark, StickyNote, Trash2, BookOpen, Plus, Tag } from 'lucide-react';
import { KnowledgeBookmark, KnowledgeAnnotationNote } from '../types/knowledgeBaseTypes';
import { DocumentCardData } from '../../../types';

interface KnowledgeBookmarksNotesTabProps {
  bookmarks: KnowledgeBookmark[];
  notes: KnowledgeAnnotationNote[];
  documents: DocumentCardData[];
  onDeleteBookmark: (id: string) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onOpenDocumentPage?: (docId: string, pageNumber: number) => void;
}

export const KnowledgeBookmarksNotesTab: React.FC<KnowledgeBookmarksNotesTabProps> = ({
  bookmarks,
  notes,
  documents,
  onDeleteBookmark,
  onDeleteNote,
  onOpenDocumentPage,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'BOOKMARKS' | 'NOTES'>('BOOKMARKS');
  const [filterDocId, setFilterDocId] = useState<string>('');

  const docMap = new Map<string, DocumentCardData>();
  for (const d of documents) {
    docMap.set(d.id, d);
  }

  const filteredBookmarks = bookmarks.filter((b) =>
    filterDocId ? b.document_id === filterDocId : true
  );

  const filteredNotes = notes.filter((n) =>
    filterDocId ? n.document_id === filterDocId : true
  );

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Subtab Switcher & Document Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('BOOKMARKS')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'BOOKMARKS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Bookmarks ({bookmarks.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('NOTES')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'NOTES'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>Annotations & Notes ({notes.length})</span>
          </button>
        </div>

        {/* Filter by Document */}
        <div className="flex items-center gap-2">
          <select
            value={filterDocId}
            onChange={(e) => setFilterDocId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Documents</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title || d.original_filename}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookmarks List */}
      {activeSubTab === 'BOOKMARKS' && (
        <div>
          {filteredBookmarks.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No bookmarks saved</p>
              <p className="text-xs text-slate-500 mt-1">
                Bookmark key pages while studying PDFs to create an instant revision index.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {filteredBookmarks.map((b) => {
                const doc = docMap.get(b.document_id);
                return (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-4 transition shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Bookmark className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{b.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="text-indigo-400 font-medium">
                            {doc?.title || 'Document'}
                          </span>
                          <span>•</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                            Page {b.page_number}
                          </span>
                          {b.note && (
                            <>
                              <span>•</span>
                              <span className="italic text-slate-500">{b.note}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteBookmark(b.id)}
                      title="Delete bookmark"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Notes List */}
      {activeSubTab === 'NOTES' && (
        <div>
          {filteredNotes.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              <StickyNote className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No annotations recorded</p>
              <p className="text-xs text-slate-500 mt-1">
                Add sticky margin notes and key takeaways directly to document pages.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {filteredNotes.map((n) => {
                const doc = docMap.get(n.document_id);
                return (
                  <div
                    key={n.id}
                    className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 space-y-2 transition shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: n.color || '#FBBF24' }}
                        />
                        <span className="font-bold text-white">{doc?.title || 'Document'}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                          Page {n.page_number}
                        </span>
                      </div>
                      <button
                        onClick={() => onDeleteNote(n.id)}
                        title="Delete note"
                        className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {n.selected_text && (
                      <p className="text-xs text-slate-400 italic bg-slate-800/50 p-2 rounded-lg border-l-2 border-indigo-500">
                        "{n.selected_text}"
                      </p>
                    )}

                    <p className="text-xs sm:text-sm text-slate-200 font-medium">{n.note_text}</p>
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
