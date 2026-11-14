import * as React from 'react';
import { Hammer, ArrowRight, FolderKanban, Code } from 'lucide-react';
import { ActiveProjectItem } from '../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export function ActiveProjects({
  projects,
  onNavigate,
}: {
  projects: ActiveProjectItem[];
  onNavigate: (path: string) => void;
}) {
  return (
    <Card className="border border-slate-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-violet-600" />
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">Active Capstone Projects</CardTitle>
            <p className="text-xs text-slate-500">Engineering milestones &amp; system architecture</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('/projects')}
          className="text-xs font-semibold text-violet-600 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </CardHeader>

      <CardContent className="space-y-3">
        {projects.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 space-y-2">
            <p>No active capstone projects initiated.</p>
            <Button variant="outline" size="sm" onClick={() => onNavigate('/projects')}>
              Create Project Blueprint
            </Button>
          </div>
        ) : (
          projects.map((proj) => (
            <div
              key={proj.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-purple-200 transition-all space-y-2.5 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{proj.title}</h4>
                  <div className="text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">Milestone:</span> {proj.current_milestone}
                  </div>
                </div>
                <span className="text-xs font-bold text-violet-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 tabular-nums shrink-0">
                  {proj.progress}%
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all duration-500"
                  style={{ width: `${proj.progress}%` }}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                <div className="flex flex-wrap items-center gap-1">
                  {proj.tech_stack.map((tech) => (
                    <span key={tech} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                      {tech}
                    </span>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate(proj.link)}
                  className="h-6 px-2 text-[10px] gap-1 self-start sm:self-auto shrink-0"
                >
                  <span>Open Project</span>
                  <ArrowRight className="h-2.5 w-2.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
