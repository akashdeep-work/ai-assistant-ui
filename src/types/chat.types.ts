export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface MessageDetails {
  role: MessageRole | string;
  content: string;
}

export interface ChatItem {
  thread_id: string;
  title: string;
}

export interface ChatMessagesResponse {
  thread_id: string;
  messages: MessageDetails[];
}

export interface ChatMessageRequest {
  thread_id: string;
  prompt: string;
}

export interface AllChatsListRequest {
  thread_ids: string[];
}

export interface AllChatListResponse {
  chats: ChatItem[];
}

export interface UploadResponse {
  file_url?: string;
  fileUrl?: string;
  filename?: string;
  message?: string;
  [key: string]: unknown;
}

export interface UiMessage {
  id: string;
  role: MessageRole;
  content: string;
  status?: 'streaming' | 'complete' | 'error';
  createdAt: number;
}

export interface ApiErrorPayload {
  detail?:
    | Array<{
        loc?: Array<string | number>;
        msg?: string;
        type?: string;
      }>
    | string;
  message?: string;
}