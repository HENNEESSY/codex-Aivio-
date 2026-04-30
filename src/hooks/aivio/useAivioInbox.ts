import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInboxBootstrap, sendManagerReply, markConversationRead } from '@/lib/api/aivio';
import { useWorkspace } from '@/lib/workspace/workspace-context';
import { toast } from 'sonner';
import { useState } from 'react';
import { UUID, Message, Conversation, AIRun } from '@/types/aivio';

export function useAivioInbox() {
  const { activeWorkspaceId } = useWorkspace();
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<UUID | null>(null);

  const inboxQuery = useQuery({
    queryKey: ['inbox', activeWorkspaceId],
    queryFn: () => getInboxBootstrap(activeWorkspaceId || undefined),
    enabled: !!activeWorkspaceId
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => markConversationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox', activeWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ['commandCenter', activeWorkspaceId] });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      if (!selectedConversationId) throw new Error('No conversation selected');
      return sendManagerReply(selectedConversationId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox', activeWorkspaceId] });
      toast.success('Сообщение отправлено');
    },
    onError: () => {
      toast.error('Ошибка при отправке сообщения. Попробуйте снова.');
    }
  });

  const selectConversation = (id: UUID) => {
    setSelectedConversationId(id);
    markAsReadMutation.mutate(id);
  };

  const sendMessage = (content: string) => {
    sendMessageMutation.mutate({ content });
  };

  const conversations = inboxQuery.data?.conversations || [];
  const allMessages = inboxQuery.data?.messages || [];
  const allRuns = inboxQuery.data?.aiRuns || [];

  const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;
  const activeMessages = selectedConversationId 
    ? allMessages.filter(m => m.conversation_id === selectedConversationId)
    : [];

  return {
    conversations,
    selectedConversation,
    messages: activeMessages,
    allMessages,
    aiRuns: allRuns,
    isLoading: inboxQuery.isLoading,
    isSending: sendMessageMutation.isPending,
    selectedConversationId,
    selectConversation,
    sendMessage,
    markAsRead: (id: UUID) => markAsReadMutation.mutate(id)
  };
}
