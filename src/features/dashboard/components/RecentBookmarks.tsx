import * as React from 'react';
import { Bookmark, ArrowRight } from 'lucide-react';
import { RecentBookmarkItem } from '../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';

export function RecentBookmarks({
  bookmarks,
  onNavigate,
}: {
  bookmarks: RecentBookmarkItem[];
  onNavigate: (path: string) => void;
}) {
  return (
    <Card className="border border-slate-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-blue-600" />
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">Saved Bookmarks</CardTitle>
            <p className="text-xs text-slate-500">Quick access to pinned learning materials</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {bookmarks.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No bookmarks saved yet. Bookmark lectures, notes, or problems to access them here.
          </div>
        ) : (
          bookmarks.map((bm) => (
            <div
              key={bm.id}
              onClick={() => onNavigate(bm.link)}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                  {bm.type}
                </span>
                <span className="font-medium text-slate-900 truncate">{bm.title}</span>
              </div>
              <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
