import { api } from './axios';
import { buildApiUrl } from '../utils/env';
import { parseBufferedStream, parseStreamLine } from '../utils/stream';
import type {
  AllChatListResponse,
  ChatMessageRequest,
  ChatMessagesResponse,
  UploadResponse,
} from '../types/chat.types';

export const healthCheck = async () => {
  const { data } = await api.get('/health_check');
  return data;
};

export const getChats = async (threadIds: string[]) => {
  const { data } = await api.post<AllChatListResponse>('/v1/api/chats/all', {
    thread_ids: threadIds,
  });

  return data;
};

export const getMessages = async (threadId: string) => {
  const { data } = await api.get<ChatMessagesResponse>(`/v1/api/chats/${threadId}`);
  return data;
};

export const uploadFile = async (file: File, onProgress?: (progress: number) => void) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<UploadResponse>('/v1/api/chats/upload', formData, {
    onUploadProgress: (event) => {
      if (!event.total || !onProgress) return;
      onProgress(Math.min(100, Math.round((event.loaded * 100) / event.total)));
    },
  });

  return data;
};

interface StreamMessageOptions {
  payload: ChatMessageRequest;
  signal?: AbortSignal;
  onChunk: (chunk: string) => void;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const readErrorResponse = async (response: Response) => {
  const text = await response.text();

  try {
    const json = JSON.parse(text) as { detail?: unknown; message?: string };

    if (typeof json.message === 'string') return json.message;
    if (typeof json.detail === 'string') return json.detail;

    if (Array.isArray(json.detail)) {
      return json.detail
        .map((item) => {
          if (typeof item !== 'object' || item === null || !('msg' in item)) return '';
          const message = (item as { msg?: unknown }).msg;
          return typeof message === 'string' ? message : '';
        })
        .filter(Boolean)
        .join(', ');
    }
  } catch {
    // Backend may return plain text for stream errors.
  }

  return text || `Request failed with status ${response.status}`;
};

export const streamMessage = async ({ payload, signal, onChunk }: StreamMessageOptions) => {
  const response = await fetch(buildApiUrl('/v1/api/chats/query'), {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream, application/x-ndjson, text/plain, application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorResponse(response));
  }

  if (!response.body) {
    const fallbackText = await response.text();
    const chunk = parseStreamLine(fallbackText);
    if (chunk) onChunk(chunk);
    return;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isLineBasedStream =
    contentType.includes('text/event-stream') ||
    contentType.includes('application/x-ndjson') ||
    contentType.includes('application/json');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const decodedValue = decoder.decode(value, { stream: true });

    if (isLineBasedStream || decodedValue.includes('data:') || decodedValue.includes('\n')) {
      buffer += decodedValue;
      buffer = parseBufferedStream(buffer, onChunk);
    } else {
      onChunk(decodedValue);
    }
  }

  const tail = decoder.decode();
  if (tail) {
    buffer += tail;
  }

  const finalChunk = parseStreamLine(buffer);
  if (finalChunk) onChunk(finalChunk);
};