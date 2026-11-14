import * as React from 'react';
import { Bell, Check, Sparkles, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '../ui/dropdown';
import { useNotifications } from '../../hooks/useNotifications';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

export function NotificationBell({ onNavigate }: { onNavigate: (url: string) => void }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const handleItemClick = (item: any) => {
    if (!item.is_read) {
      markAsRead(item.id);
    }
    if (item.link) {
      onNavigate(item.link);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    toast.success('All notifications marked as read');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ai': return <Sparkles className="h-4 w-4 text-indigo-600" />;
      case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white tabular-nums">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 sm:w-96 p-0 shadow-lg border border-slate-200 bg-white" align="end">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-slate-900">Notifications</h4>
            {unreadCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold tabular-nums">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-blue-600 hover:underline font-medium cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No notifications yet. You're all caught up!
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'flex items-start gap-3 p-3 transition-colors cursor-pointer hover:bg-slate-50',
                  !item.is_read ? 'bg-blue-50/30' : ''
                )}
              >
                <div className="p-1.5 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="text-xs font-semibold text-slate-900 truncate">{item.title}</h5>
                    {!item.is_read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 mt-0.5">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-slate-400 tabular-nums mt-1 block">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-200 bg-slate-50/70 text-center">
          <span className="text-[11px] text-slate-500">B.Tech AI Learning Workspace Notifications</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
