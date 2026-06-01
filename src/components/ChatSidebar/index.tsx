import { AnimatePresence, motion } from 'framer-motion';
import {
  MessageSquareText,
  PanelLeftClose,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type { ChatItem } from '../../types/chat.types';
import HealthStatus from '../HealthStatus';

interface ChatSidebarProps {
  activeThreadId: string;
  chats: ChatItem[];
  threadIds: string[];
  isLoading: boolean;
  isDesktopOpen: boolean;
  isMobileOpen: boolean;
  onNewChat: () => void;
  onSelectThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  onCloseMobile: () => void;
  onToggleDesktop: () => void;
}

export default function ChatSidebar({
  activeThreadId,
  chats,
  threadIds,
  isLoading,
  isDesktopOpen,
  isMobileOpen,
  onNewChat,
  onSelectThread,
  onDeleteThread,
  onCloseMobile,
  onToggleDesktop,
}: ChatSidebarProps) {
  const chatMap = new Map(chats.map((chat) => [chat.thread_id, chat]));

  const sidebarItems = threadIds.map((threadId) => ({
    thread_id: threadId,
    last_message: chatMap.get(threadId)?.last_message || 'New conversation',
  }));

  return (
    <>
      {/* Mobile/tablet backdrop */}
      {isMobileOpen ? (
        <button
          type="button"
          aria-label="Close sidebar backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-80 shrink-0 flex-col border-r border-white/10 bg-slate-950/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl transition-all duration-300 lg:static lg:z-auto lg:bg-slate-950/80 lg:shadow-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDesktopOpen
            ? 'lg:w-80 lg:translate-x-0 lg:p-4 lg:opacity-100'
            : 'lg:w-0 lg:-translate-x-full lg:overflow-hidden lg:border-r-0 lg:p-0 lg:opacity-0'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">
              Workspace
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">AI Assistant</h2>
          </div>

          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={onToggleDesktop}
            className="hidden rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:inline-flex"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={18} />
          </button>

          {/* Mobile/tablet close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={onNewChat}
          className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 transition hover:bg-violet-500"
        >
          <Plus size={18} />
          New chat
        </button>

        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-400">
          <Search size={16} />
          <span>Recent conversations</span>
        </div>

        <div className="custom-scrollbar mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
          {isLoading && sidebarItems.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
              Loading chats...
            </div>
          ) : null}

          <AnimatePresence initial={false}>
            {sidebarItems.map((chat) => {
              const isActive = chat.thread_id === activeThreadId;

              return (
                <motion.div
                  key={chat.thread_id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className={`group flex items-center gap-2 rounded-2xl border p-2 transition ${
                    isActive
                      ? 'border-violet-300/30 bg-violet-500/20'
                      : 'border-transparent bg-transparent hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectThread(chat.thread_id)}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-violet-200">
                      <MessageSquareText size={17} />
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-100">
                        {chat.last_message}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {chat.thread_id}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteThread(chat.thread_id)}
                    className="rounded-xl p-2 text-slate-500 opacity-100 transition hover:bg-red-500/10 hover:text-red-300 lg:opacity-0 lg:group-hover:opacity-100"
                    aria-label="Delete chat"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="mt-4">
          <HealthStatus />
        </div>
      </aside>
    </>
  );
}