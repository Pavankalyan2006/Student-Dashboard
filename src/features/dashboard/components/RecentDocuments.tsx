import * as React from 'react';
import { Files, ArrowRight, FileText, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { DocumentCardData } from '../../documents/types/document';
import { DocumentStatusBadge } from '../../documents/components/DocumentStatusBadge';

export function RecentDocuments({
  documents,
  onNavigate,
}: {
  documents?: DocumentCardData[];
  onNavigate: (path: string) => void;
}) {
  const items = documents || [];

  return (
    <Card className="border border-slate-200 bg-white shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
            <Files className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">Recent Documents</CardTitle>
            <p className="text-xs text-slate-500">AI-indexed textbooks, lecture slides & notes</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('/documents')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </button>
      </CardHeader>

      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 space-y-2">
            <p>No documents uploaded yet.</p>
            <button
              onClick={() => onNavigate('/documents/upload')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
            >
              Upload your first document
            </button>
          </div>
        ) : (
          items.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onNavigate(`/documents/${doc.id}`)}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/80 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600 font-bold text-[10px] uppercase">
                  {doc.file_extension}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {doc.title}
                    </h5>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    {doc.page_count ? <span>{doc.page_count} pages</span> : null}
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {new Date(doc.last_opened_at || doc.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <DocumentStatusBadge status={doc.status} />
                <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
