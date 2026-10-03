import * as React from 'react';
import {
  Bell,
  CheckCircle2,
  Check,
  Sparkles,
  Award,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import { toast } from 'sonner';

export function NotificationsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [unreadOnly, setUnreadOnly] = React.useState(false);

  React.useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await communityProfileApi.getNotifications();
      setNotifications(res.items);
      setUnreadCount(res.unreadCount);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string, link?: string) => {
    try {
      await communityProfileApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (link) {
        onNavigate(link);
      }
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await communityProfileApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const filtered = unreadOnly ? notifications.filter((n) => !n.is_read) : notifications;

  const getIcon = (type: string) => {
    if (type.includes('ACHIEVEMENT') || type.includes('CERTIFICATE')) {
      return <Award className="h-4 w-4 text-purple-600" />;
    }
    if (type.includes('QUESTION') || type.includes('ANSWER')) {
      return <HelpCircle className="h-4 w-4 text-[#2563EB]" />;
    }
    if (type.includes('DISCUSSION')) {
      return <MessageSquare className="h-4 w-4 text-emerald-600" />;
    }
    return <Sparkles className="h-4 w-4 text-[#4F46E5]" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E7EC] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#101828]">Notification Center</h1>
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-[#2563EB] font-bold">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-[#667085]">
            Updates from learning milestones, community answers, peer discussions, and system events.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-[#2563EB] hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
            >
              Mark all as read
            </button>
          )}

          <button
            onClick={() => onNavigate('/profile/settings?tab=notifications')}
            className="p-2 text-[#475467] hover:text-[#101828] hover:bg-slate-100 rounded-lg border border-[#E4E7EC] cursor-pointer"
            title="Notification Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setUnreadOnly(false)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            !unreadOnly ? 'bg-blue-50 text-[#2563EB]' : 'text-[#475467] hover:bg-slate-100'
          }`}
        >
          All Notifications ({notifications.length})
        </button>

        <button
          onClick={() => setUnreadOnly(true)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            unreadOnly ? 'bg-blue-50 text-[#2563EB]' : 'text-[#475467] hover:bg-slate-100'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#667085] flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-[#2563EB]" />
            <span>Loading notifications...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#667085] space-y-2">
            <Bell className="h-8 w-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No notifications found</p>
            <p className="text-[11px] text-slate-500">You are completely caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMarkRead(item.id, item.link)}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer hover:bg-slate-50 ${
                  !item.is_read ? 'bg-blue-50/20' : ''
                }`}
              >
                <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-[#101828] truncate">{item.title}</h3>
                    <span className="text-[10px] text-[#98A2B3] tabular-nums shrink-0">
                      {new Date(item.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-[#475467] leading-relaxed">{item.message}</p>
                </div>

                {!item.is_read && (
                  <span className="h-2 w-2 rounded-full bg-[#2563EB] shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
