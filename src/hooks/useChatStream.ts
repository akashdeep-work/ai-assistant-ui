import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { streamMessage } from '../apis/chat.api';
import type { ChatMessageRequest } from '../types/chat.types';

interface StreamVariables {
  payload: ChatMessageRequest;
  onChunk: (chunk: string) => void;
}

export const useChatStream = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ payload, onChunk }: StreamVariables) => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await streamMessage({
          payload,
          signal: controller.signal,
          onChunk,
        });
      } finally {
        abortControllerRef.current = null;
      }
    },
  });

  return {
    ...mutation,
    cancel: () => abortControllerRef.current?.abort(),
  };
};