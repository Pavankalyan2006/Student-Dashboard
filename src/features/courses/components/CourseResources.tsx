import * as React from 'react';
import {
  FileText,
  Code2,
  ExternalLink,
  Plus,
  Trash2,
  FileCheck,
  Link as LinkIcon,
} from 'lucide-react';
import { CourseResource } from '../types/courses';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export function CourseResources({
  resources,
  onNavigate,
  onOpenLinkModal,
  onRemoveResource,
}: {
  resources: CourseResource[];
  onNavigate: (path: string) => void;
  onOpenLinkModal?: () => void;
  onRemoveResource?: (resourceId: string) => void;
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-4 w-4 text-rose-600" />;
      case 'DOCUMENT':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'NOTES':
        return <FileCheck className="h-4 w-4 text-indigo-600" />;
      case 'CODE':
        return <Code2 className="h-4 w-4 text-emerald-600" />;
      default:
        return <ExternalLink className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <Card className="border border-[#E4E7EC] bg-white">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold text-[#101828]">
            Course Resources &amp; Documents
          </CardTitle>
          <p className="text-xs text-[#667085]">
            Verified lecture materials, linked notes, and reference files
          </p>
        </div>
        {onOpenLinkModal && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenLinkModal}
            className="text-xs gap-1.5 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Link Resource</span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {resources.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <LinkIcon className="h-6 w-6 text-slate-300 mx-auto" />
            <p className="text-xs text-[#667085]">
              No documents or notes linked to this course yet.
            </p>
            {onOpenLinkModal && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenLinkModal}
                className="text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Attach Study Material</span>
              </Button>
            )}
          </div>
        ) : (
          resources.map((res) => (
            <div
              key={res.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all text-xs group"
            >
              <div
                onClick={() => onNavigate(res.url)}
                className="flex items-center gap-2.5 min-w-0 pr-2 cursor-pointer flex-1"
              >
                <div className="p-1.5 rounded-lg bg-slate-100 shrink-0">{getIcon(res.type)}</div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 group-hover:text-[#2563EB] transition-colors truncate">
                    {res.title}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="uppercase font-mono">{res.type}</span>
                    {res.size_bytes && (
                      <>
                        <span>·</span>
                        <span>{Math.round(res.size_bytes / 1024)} KB</span>
                      </>
                    )}
                    {res.processing_status && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-700 bg-emerald-50 px-1 rounded font-semibold">
                          {res.processing_status}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate(res.url)}
                  className="flex items-center gap-1 font-semibold text-[#2563EB] text-[11px] hover:underline cursor-pointer px-1 py-0.5"
                >
                  <span>Open</span>
                  <ExternalLink className="h-3 w-3" />
                </button>

                {onRemoveResource && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Unlink resource "${res.title}"?`)) {
                        onRemoveResource(res.id);
                      }
                    }}
                    title="Unlink resource"
                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
