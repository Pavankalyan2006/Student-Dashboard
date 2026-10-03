import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationApi } from '../api/conversationApi';
import { AIConversation } from '../types/ai';
import { toast } from 'sonner';

export function useConversations(selectedId?: string, onSelect?: (id: string) => void) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: conversations = [], isLoading } = useQuery<AIConversation[]>({
    queryKey: ['ai-conversations', searchQuery],
    queryFn: () =>
      searchQuery.trim()
        ? conversationApi.searchConversations(searchQuery)
        : conversationApi.getConversations(),
  });

  const createMutation = useMutation({
    mutationFn: (title?: string) => conversationApi.createConversation(title),
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      toast.success('Started new learning session');
      onSelect?.(newConv.id);
    },
    onError: () => toast.error('Failed to create session'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AIConversation> }) =>
      conversationApi.updateConversation(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData<AIConversation[]>(['ai-conversations', ''], (old) => {
        if (!old) return old;
        return old.map((c) => (c.id === updated.id ? updated : c));
      });
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      toast.success('Session updated');
    },
    onError: () => toast.error('Failed to update session'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => conversationApi.deleteConversation(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      toast.success('Conversation deleted');
      if (selectedId === deletedId) {
        onSelect?.('');
      }
    },
    onError: () => toast.error('Failed to delete conversation'),
  });

  const pinnedConversations = conversations.filter((c) => c.is_pinned);
  const recentConversations = conversations.filter((c) => !c.is_pinned);

  return {
    conversations,
    pinnedConversations,
    recentConversations,
    isLoading,
    searchQuery,
    setSearchQuery,
    createConversation: (title?: string) => createMutation.mutate(title),
    isCreating: createMutation.isPending,
    updateConversation: (id: string, updates: Partial<AIConversation>) =>
      updateMutation.mutate({ id, updates }),
    deleteConversation: (id: string) => deleteMutation.mutate(id),
  };
}
