import type { MessageDetails, MessageRole, UiMessage } from '../types/chat.types';

export const makeMessageId = (prefix = 'message') => {
  const randomPart =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `${prefix}_${randomPart}`;
};

export const normalizeRole = (role: string): MessageRole => {
  if (role === 'assistant' || role === 'user') {
    return role;
  }

  return 'assistant';
};

export const toUiMessages = (threadId: string, messages: MessageDetails[] = []): UiMessage[] =>
  messages.map((message, index) => ({
    id: `${threadId}_history_${index}`,
    role: normalizeRole(message.role),
    content: message.content ?? '',
    status: 'complete',
    createdAt: index,
  }));