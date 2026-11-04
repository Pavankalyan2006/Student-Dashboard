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
  Trash2,
  Calendar,
  AlertCircle,
  Clock,
  ExternalLink,
  Filter
} from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import { toast } from 'sonner';

const CATEGORIES = [
  { id: 'ALL', label: 'All Updates' },
  { id: 'GOAL', label: 'Goals & Deadlines' },
  { id: 'STUDY', label: 'Study & Revision' },
  { id: 'ASSESSMENT', label: 'Assessments' },
  { id: 'COMMUNITY', label: 'Community' },
  { id: 'SYSTEM', label: 'System' },
];

export function NotificationsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState('ALL');
  const [scanningReminders, setScanningReminders] = React.useState(false);

  React.useEffect(() => {
    loadNotifications();
  }, [unreadOnly, selectedCategory]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await communityProfileApi.getNotifications({
        unreadOnly: unreadOnly ? true : undefined,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
      });
      setNotifications(res.items || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to load notifications');
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

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await communityProfileApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification dismissed');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleScanReminders = async () => {
    try {
      setScanningReminders(true);
      const res = await communityProfileApi.generateReminders();
      const count = res.generated_count ?? (res as any).generated ?? 0;
      if (count > 0) {
        toast.success(`Generated ${count} reminder${count > 1 ? 's' : ''}`);
        await loadNotifications();
      } else {
        toast.info((res as any).message || 'No new reminders needed. You are up to date!');
      }
    } catch {
      toast.error('Failed to scan reminders');
    } finally {
      setScanningReminders(false);
    }
  };

  const getIcon = (type: string) => {
    const t = (type || '').toUpperCase();
    if (t.includes('ACHIEVEMENT') || t.includes('CERTIFICATE')) {
      return <Award className="h-4 w-4 text-purple-600" />;
    }
    if (t.includes('GOAL') || t.includes('DEADLINE')) {
      return <Calendar className="h-4 w-4 text-amber-600" />;
    }
    if (t.includes('QUESTION') || t.includes('ANSWER')) {
      return <HelpCircle className="h-4 w-4 text-[#2563EB]" />;
    }
    if (t.includes('DISCUSSION') || t.includes('COMMUNITY')) {
      return <MessageSquare className="h-4 w-4 text-emerald-600" />;
    }
    if (t.includes('STUDY') || t.includes('REVISION')) {
      return <BookOpen className="h-4 w-4 text-blue-600" />;
    }
    return <Sparkles className="h-4 w-4 text-[#4F46E5]" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E7EC] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#101828]">Notification Center</h1>
            {unreadCount > 0 ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-[#2563EB] font-bold">
                {unreadCount} unread
              </span>
            ) : (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-[#475467] font-medium">
                Caught up
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Real alerts for academic deadlines, goal milestones, spaced revisions, assessment updates, and community activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleScanReminders}
            disabled={scanningReminders}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D0D5DD] bg-white text-xs font-semibold text-[#344054] hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            title="Scan upcoming goal target dates and study tasks for reminders"
          >
            <Clock className={`h-3.5 w-3.5 ${scanningReminders ? 'animate-spin' : ''}`} />
            <span>{scanningReminders ? 'Checking...' : 'Check Deadlines'}</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-[#2563EB] hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
            >
              Mark all read
            </button>
          )}

          <button
            onClick={() => onNavigate('/profile/settings?tab=notifications')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#475467] hover:text-[#101828] hover:bg-slate-100 rounded-lg border border-[#E4E7EC] cursor-pointer"
            title="Configure delivery channels and category preferences"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preferences</span>
          </button>
        </div>
      </div>

      {/* Category and Read Status Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Read / Unread toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto shrink-0">
          <button
            onClick={() => setUnreadOnly(false)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              !unreadOnly ? 'bg-white text-[#101828] shadow-2xs' : 'text-[#667085] hover:text-[#101828]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setUnreadOnly(true)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              unreadOnly ? 'bg-white text-[#2563EB] shadow-2xs' : 'text-[#667085] hover:text-[#101828]'
            }`}
          >
            Unread Only {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </div>

      {/* Main Notification Card List */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#667085] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-[#2563EB]" />
            <span className="font-medium">Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">{error}</p>
            <button
              onClick={loadNotifications}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-14 text-center text-xs text-[#667085] space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">No notifications found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {unreadOnly
                  ? 'You have read all your notifications.'
                  : selectedCategory !== 'ALL'
                  ? `No notifications in the ${selectedCategory.toLowerCase()} category yet.`
                  : 'You are completely caught up! New alerts will appear when goal deadlines approach or study items are due.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMarkRead(item.id, item.link)}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer group hover:bg-slate-50/80 ${
                  !item.is_read ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5 group-hover:bg-white group-hover:shadow-2xs transition-all">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <h3 className="text-xs sm:text-sm font-bold text-[#101828] truncate">
                        {item.title}
                      </h3>
                      {!item.is_read && (
                        <span className="h-2 w-2 rounded-full bg-[#2563EB] shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-[#98A2B3] tabular-nums shrink-0">
                      {new Date(item.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-[#475467] leading-relaxed line-clamp-2">
                    {item.message}
                  </p>

                  {item.link && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] pt-1">
                      <span>Open destination</span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  )}
                </div>

                {/* Dismiss button */}
                <div className="shrink-0 flex items-center gap-1">
                  <button
                    onClick={(e) => handleDeleteNotification(e, item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                    title="Dismiss notification"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
