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

    return (
      <div
        key={conv.id}
        onClick={() => {
          onSelect(conv.id);
          onCloseMobile?.();
        }}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
          isSelected
            ? 'bg-blue-50/80 text-[#2563EB] border border-blue-200/80 shadow-2xs font-semibold'
            : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
          <MessageSquare
            className={`h-3.5 w-3.5 shrink-0 ${
              isSelected ? 'text-[#2563EB]' : 'text-slate-400 group-hover:text-slate-600'
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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(conv.id)} danger>
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
    <div className="flex flex-col h-full bg-white border-r border-[#E4E7EC] overflow-hidden">
      {/* Top Header & New Chat button */}
      <div className="p-3 border-b border-[#E4E7EC] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#4F46E5]" />
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
            placeholder="Search conversations..."
            className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-[#E4E7EC] rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
        {conversations.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-1">
            <p>No conversations found</p>
            <p className="text-[11px] text-slate-400">Start a new chat to begin</p>
          </div>
        ) : (
          <>
            {/* Pinned conversations */}
            {pinnedConversations.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <Pin className="h-3 w-3" />
                  <span>Pinned</span>
                </div>
                <div className="space-y-0.5">
                  {pinnedConversations.map(renderConversationItem)}
                </div>
              </div>
            )}

            {/* Recent conversations */}
            <div className="space-y-1">
              {pinnedConversations.length > 0 && (
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Recent</span>
                </div>
              )}
              <div className="space-y-0.5">
                {recentConversations.map(renderConversationItem)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
