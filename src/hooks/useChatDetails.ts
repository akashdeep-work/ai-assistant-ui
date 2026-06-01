import { useQuery } from '@tanstack/react-query';
import { getMessages } from '../apis/chat.api';

export const useChatDetails = (threadId: string) =>
  useQuery({
    queryKey: ['chat', threadId],
    queryFn: () => getMessages(threadId),
    enabled: Boolean(threadId),
  });