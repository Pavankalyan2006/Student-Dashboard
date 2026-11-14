import * as React from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  MoreVertical,
  X,
  Sparkles,
  Archive,
} from 'lucide-react';
import { AIConversation } from '../types/ai';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../../../components/ui/dropdown';

export function ConversationSidebar({
  conversations,
  pinnedConversations,
  recentConversations,
  selectedId,
  searchQuery,
  onSearchChange,
  onSelect,
  onNewChat,
  onUpdate,
  onDelete,
  onCloseMobile,
}: {
  conversations: AIConversation[];
  pinnedConversations: AIConversation[];
  recentConversations: AIConversation[];
  selectedId?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onUpdate: (id: string, updates: Partial<AIConversation>) => void;
  onDelete: (id: string) => void;
  onCloseMobile?: () => void;
}) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');

  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'all' | 'pinned' | 'archived'>('all');

  const handleStartRename = (conv: AIConversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onUpdate(id, { title: editTitle.trim() });
    }
    setEditingId(null);
  };

  const renderConversationItem = (conv: AIConversation) => {
    const isSelected = conv.id === selectedId;

    if (deleteConfirmId === conv.id) {
      return (
        <div
          key={conv.id}
          className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 text-xs space-y-1.5"
        >
          <p className="font-semibold text-rose-900">Delete this learning session?</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onDelete(conv.id);
                setDeleteConfirmId(null);
              }}
              className="px-2 py-1 bg-rose-600 text-white rounded font-medium text-[11px] hover:bg-rose-700 cursor-pointer"
            >
              Confirm
            </button>
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded font-medium text-[11px] hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={conv.id}
        onClick={() => {
          onSelect(conv.id);
          onCloseMobile?.();
        }}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
          isSelected
            ? 'bg-blue-50/80 text-blue-600 border border-blue-200/80 shadow-2xs font-semibold'
            : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
          <MessageSquare
            className={`h-3.5 w-3.5 shrink-0 ${
              isSelected ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
            }`}
          />

          {editingId === conv.id ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename(conv.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              onBlur={() => handleSaveRename(conv.id)}
              autoFocus
              className="w-full bg-white px-1.5 py-0.5 rounded border border-blue-400 text-xs text-slate-900 focus:outline-none"
            />
          ) : (
            <span className="truncate">{conv.title}</span>
          )}
        </div>

        {/* Pin icon indicator */}
        {conv.is_pinned && !editingId && (
          <Pin className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0 mr-1" />
        )}

        {/* Message count badge */}
        {typeof conv.message_count === 'number' && conv.message_count > 0 && (
          <span className="text-[10px] text-slate-400 font-mono px-1 rounded bg-slate-100 mr-1">
            {conv.message_count}
          </span>
        )}

        {/* Item action menu */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/60 cursor-pointer"
                aria-label="Conversation options"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="end">
              <DropdownMenuItem onClick={() => handleStartRename(conv)}>
                <Edit2 className="h-3.5 w-3.5 mr-2 text-slate-500" />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdate(conv.id, { is_pinned: !conv.is_pinned })}
              >
                <Pin className="h-3.5 w-3.5 mr-2 text-amber-500" />
                <span>{conv.is_pinned ? 'Unpin' : 'Pin to Top'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdate(conv.id, { is_archived: !conv.is_archived })}
              >
                <Archive className="h-3.5 w-3.5 mr-2 text-slate-500" />
                <span>{conv.is_archived ? 'Unarchive' : 'Archive'}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDeleteConfirmId(conv.id)} danger>
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 overflow-hidden">
      {/* Top Header & New Chat button */}
      <div className="p-3 border-b border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Learning Chats
            </h3>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            onNewChat();
            onCloseMobile?.();
          }}
          className="w-full justify-center gap-1.5 shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Chat Session</span>
        </Button>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search conversations"
            placeholder="Search conversations..."
            className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-[11px] font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-white text-blue-600 shadow-2xs font-semibold' : 'hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('pinned')}
            className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
              activeTab === 'pinned' ? 'bg-white text-blue-600 shadow-2xs font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Pinned
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`flex-1 py-1 rounded-md text-center transition-all cursor-pointer ${
              activeTab === 'archived' ? 'bg-white text-blue-600 shadow-2xs font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Archived
          </button>
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
        {(() => {
          const displayed = conversations.filter((c) => {
            if (activeTab === 'pinned') return c.is_pinned && !c.is_archived;
            if (activeTab === 'archived') return c.is_archived;
            return !c.is_archived;
          });

          if (displayed.length === 0) {
            return (
              <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                <p>No {activeTab !== 'all' ? activeTab : ''} conversations</p>
                <p className="text-[11px] text-slate-400">
                  {activeTab === 'archived' ? 'No archived chats' : 'Start a new chat to begin'}
                </p>
              </div>
            );
          }

          if (activeTab === 'pinned') {
            return (
              <div className="space-y-0.5">
                {displayed.map(renderConversationItem)}
              </div>
            );
          }

          if (activeTab === 'archived') {
            return (
              <div className="space-y-0.5">
                {displayed.map(renderConversationItem)}
              </div>
            );
          }

          const pinned = displayed.filter((c) => c.is_pinned);
          const recent = displayed.filter((c) => !c.is_pinned);

          return (
            <>
              {pinned.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Pin className="h-3 w-3" />
                    <span>Pinned ({pinned.length})</span>
                  </div>
                  <div className="space-y-0.5">
                    {pinned.map(renderConversationItem)}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {pinned.length > 0 && (
                  <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Recent ({recent.length})</span>
                  </div>
                )}
                <div className="space-y-0.5">
                  {recent.map(renderConversationItem)}
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
