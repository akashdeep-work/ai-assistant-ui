import { useQuery } from '@tanstack/react-query';
import { getChats } from '../apis/chat.api';

export const useChatHistory = (threadIds: string[]) =>
  useQuery({
    queryKey: ['chats', threadIds],
    queryFn: () => getChats(threadIds),
    enabled: threadIds.length > 0,
  });