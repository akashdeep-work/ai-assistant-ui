import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  FileUp,
  Loader2,
  Menu,
  PanelLeftOpen,
  Paperclip,
  Send,
  Square,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '../../apis/axios';
import { useChatDetails } from '../../hooks/useChatDetails';
import { useChatStream } from '../../hooks/useChatStream';
import { useUploadFile } from '../../hooks/useUploadFile';
import type { UiMessage } from '../../types/chat.types';
import { makeMessageId, toUiMessages } from '../../utils/messages';
import EmptyState from '../EmptyState';
import MessageItem from '../MessageItem';

interface ChatAreaProps {
  activeThreadId: string;
  onEnsureThread: (threadId: string) => void;
  onOpenMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
}

export default function ChatArea({
  activeThreadId,
  onEnsureThread,
  onOpenMobileSidebar,
  onToggleDesktopSidebar,
}: ChatAreaProps) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<UiMessage[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chatDetailsQuery = useChatDetails(activeThreadId);
  const streamMutation = useChatStream();
  const uploadMutation = useUploadFile();
  const assistantContentRef = useRef('');

  const historyMessages = useMemo(
    () => toUiMessages(activeThreadId, chatDetailsQuery.data?.messages ?? []),
    [activeThreadId, chatDetailsQuery.data?.messages],
  );

  const displayMessages = useMemo(
    () => [...historyMessages, ...localMessages],
    [historyMessages, localMessages],
  );

  useEffect(() => {
    setLocalMessages([]);
    setInput('');
  }, [activeThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [displayMessages, streamMutation.isPending]);

  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = '0px';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
  }, [input]);

  const updateAssistantMessage = (
    assistantId: string,
    updater: (message: UiMessage) => UiMessage,
  ) => {
    setLocalMessages((messages) =>
      messages.map((message) => (message.id === assistantId ? updater(message) : message)),
    );
  };

  const sendPrompt = (prompt: string) => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || streamMutation.isPending) return;

    onEnsureThread(activeThreadId);
    setInput('');

    const userMessage: UiMessage = {
      id: makeMessageId('user'),
      role: 'user',
      content: trimmedPrompt,
      status: 'complete',
      createdAt: Date.now(),
    };

    const assistantId = makeMessageId('assistant');

    const assistantMessage: UiMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      status: 'streaming',
      createdAt: Date.now() + 1,
    };

    setLocalMessages((messages) => [...messages, userMessage, assistantMessage]);

    assistantContentRef.current = '';

streamMutation.mutate(
  {
    payload: {
      thread_id: activeThreadId,
      prompt: trimmedPrompt,
    },
    onChunk: (chunk) => {
      assistantContentRef.current += chunk;

      updateAssistantMessage(assistantId, (message) => ({
        ...message,
        content: assistantContentRef.current,
      }));
    },
  },
  {
    // onSuccess: () => {
    //   const finalAssistantContent = assistantContentRef.current || 'Done.';

    //   updateAssistantMessage(assistantId, (message) => ({
    //     ...message,
    //     status: 'complete',
    //     content: finalAssistantContent,
    //   }));

    //   queryClient.setQueryData(
    //     ['chat', activeThreadId],
    //     (
    //       oldData:
    //         | {
    //             thread_id: string;
    //             messages: { role: string; content: string }[];
    //           }
    //         | undefined,
    //     ) => {
    //       const oldMessages = oldData?.messages ?? [];

    //       return {
    //         thread_id: activeThreadId,
    //         messages: [
    //           ...oldMessages,
    //           {
    //             role: 'user',
    //             content: trimmedPrompt,
    //           },
    //           {
    //             role: 'assistant',
    //             content: finalAssistantContent,
    //           },
    //         ],
    //       };
    //     },
    //   );

    //   setLocalMessages([]);

    //   queryClient.invalidateQueries({
    //     queryKey: ['chats'],
    //   });
    // },
    // onError: (error) => {
    //   const wasAborted = error instanceof DOMException && error.name === 'AbortError';

    //   updateAssistantMessage(assistantId, (message) => ({
    //     ...message,
    //     status: wasAborted ? 'complete' : 'error',
    //     content: message.content || (wasAborted ? 'Generation stopped.' : getApiErrorMessage(error)),
    //   }));
    // },
  },
);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return;

    event.preventDefault();
    sendPrompt(input);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || uploadMutation.isPending) return;

    onEnsureThread(activeThreadId);
    setUploadProgress(0);

    const uploadMessageId = makeMessageId('upload');

    setLocalMessages((messages) => [
      ...messages,
      {
        id: uploadMessageId,
        role: 'assistant',
        content: `Uploading ${file.name}...`,
        status: 'streaming',
        createdAt: Date.now(),
      },
    ]);

    uploadMutation.mutate(
      {
        file,
        onProgress: setUploadProgress,
      },
      {
        onSuccess: (data) => {
          const fileName = data.filename || file.name;

          updateAssistantMessage(uploadMessageId, (message) => ({
            ...message,
            status: 'complete',
            content:
              data.message ||
              `${fileName} uploaded successfully. Ask a question about it when you are ready.`,
          }));

          setUploadProgress(100);
          queryClient.invalidateQueries({ queryKey: ['chats'] });
        },
        onError: (error) => {
          updateAssistantMessage(uploadMessageId, (message) => ({
            ...message,
            status: 'error',
            content: getApiErrorMessage(error),
          }));
        },
        onSettled: () => {
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
      },
    );
  };

  const isEmpty = !chatDetailsQuery.isLoading && displayMessages.length === 0;

  return (
    <main className="flex h-screen min-w-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/55 px-4 py-4 backdrop-blur-2xl md:px-7">
  <div className="flex min-w-0 items-center gap-3">
    {/* Mobile/tablet sidebar open button */}
    <button
      type="button"
      onClick={onOpenMobileSidebar}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
      aria-label="Open sidebar"
    >
      <Menu size={21} />
    </button>

    {/* Desktop sidebar toggle button - visible even when sidebar is collapsed */}
    <button
      type="button"
      onClick={onToggleDesktopSidebar}
      className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/10 hover:text-white lg:flex"
      aria-label="Toggle sidebar"
    >
      <PanelLeftOpen size={21} />
    </button>

    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500 text-white shadow-lg shadow-violet-950/40">
      <Bot size={22} />
    </div>

    <div className="min-w-0">
      <h1 className="truncate text-base font-bold text-white md:text-lg">
        AI Assistant
      </h1>
      <p className="truncate text-xs text-slate-400">
        Thread: {activeThreadId}
      </p>
    </div>
  </div>

  <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 md:flex">
    <span className="h-2 w-2 rounded-full bg-violet-300" />
    Streaming ready
  </div>
</header>

      <section className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
        {chatDetailsQuery.isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="animate-spin text-violet-200" size={34} />
          </div>
        ) : isEmpty ? (
          <EmptyState onPromptClick={sendPrompt} />
        ) : (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
            <AnimatePresence initial={false}>
              {displayMessages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        )}
      </section>

      <footer className="shrink-0 border-t border-white/10 bg-slate-950/65 p-4 backdrop-blur-2xl md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-4xl rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-3 shadow-2xl shadow-black/30"
        >
          {uploadMutation.isPending ? (
            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-100">
              <FileUp size={16} />
              Uploading file {uploadProgress}%

              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-violet-300 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className="flex items-end gap-2">
            <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl text-slate-300 transition hover:bg-white/10 hover:text-white">
              <Paperclip size={20} />

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploadMutation.isPending}
              />
            </label>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message the assistant..."
              rows={1}
              disabled={streamMutation.isPending}
              className="max-h-44 min-h-11 flex-1 resize-none border-0 bg-transparent px-2 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-70"
            />

            {streamMutation.isPending ? (
              <button
                type="button"
                onClick={streamMutation.cancel}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950 transition hover:bg-slate-200"
                aria-label="Stop generating"
              >
                <Square size={17} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => sendPrompt(input)}
                disabled={!input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-950/40 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            )}
          </div>
        </motion.div>
      </footer>
    </main>
  );
}