import * as React from 'react';
import { FileText, Code2, ExternalLink, Download } from 'lucide-react';
import { CourseResource } from '../types/courses';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';

export function CourseResources({
  resources,
  onNavigate,
}: {
  resources: CourseResource[];
  onNavigate: (path: string) => void;
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-4 w-4 text-rose-600" />;
      case 'CODE':
        return <Code2 className="h-4 w-4 text-[#2563EB]" />;
      default:
        return <ExternalLink className="h-4 w-4 text-emerald-600" />;
    }
  };

  return (
    <Card className="border border-[#E4E7EC] bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-[#101828]">Course Resources &amp; Downloads</CardTitle>
        <p className="text-xs text-[#667085]">Verified lecture materials, starter code, and reference notes</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {resources.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#667085]">
            No downloadable resources attached to this syllabus yet.
          </div>
        ) : (
          resources.map((res) => (
            <div
              key={res.id}
              onClick={() => onNavigate(res.url)}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="p-1.5 rounded-lg bg-slate-100 shrink-0">{getIcon(res.type)}</div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{res.title}</div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">{res.type}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 font-semibold text-[#2563EB] shrink-0 text-[11px]">
                <span>Access</span>
                <ExternalLink className="h-3 w-3" />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
