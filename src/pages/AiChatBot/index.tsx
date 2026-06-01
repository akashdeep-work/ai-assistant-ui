import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ChatArea from '../../components/ChatArea';
import ChatSidebar from '../../components/ChatSidebar';
import { useChatHistory } from '../../hooks/useChatHistory';
import {
  createThreadId,
  ensureThreadId,
  getStoredThreadIds,
  removeThreadId,
  saveThreadIds,
} from '../../utils/threadStorage';

const initializeThreads = () => {
  const storedThreadIds = getStoredThreadIds();

  if (storedThreadIds.length > 0) {
    return {
      threadIds: storedThreadIds,
      activeThreadId: storedThreadIds[0],
    };
  }

  const firstThreadId = createThreadId();
  saveThreadIds([firstThreadId]);

  return {
    threadIds: [firstThreadId],
    activeThreadId: firstThreadId,
  };
};

export default function AIChatBot() {
  const initialState = useMemo(() => initializeThreads(), []);

  const [threadIds, setThreadIds] = useState<string[]>(initialState.threadIds);
  const [activeThreadId, setActiveThreadId] = useState(initialState.activeThreadId);

  // Desktop sidebar state
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  // Mobile/tablet sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const chatHistoryQuery = useChatHistory(threadIds);

  const handleEnsureThread = (threadId: string) => {
    const updatedThreadIds = ensureThreadId(threadId);
    setThreadIds(updatedThreadIds);
  };

  const handleNewChat = () => {
    const newThreadId = createThreadId();
    const updatedThreadIds = saveThreadIds([newThreadId, ...threadIds]);

    setThreadIds(updatedThreadIds);
    setActiveThreadId(newThreadId);

    // Close drawer after action on mobile/tablet
    setIsMobileSidebarOpen(false);
  };

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);

    // Close drawer after selecting chat on mobile/tablet
    setIsMobileSidebarOpen(false);
  };

  const handleDeleteThread = (threadId: string) => {
    const updatedThreadIds = removeThreadId(threadId);

    if (updatedThreadIds.length === 0) {
      const newThreadId = createThreadId();
      saveThreadIds([newThreadId]);
      setThreadIds([newThreadId]);
      setActiveThreadId(newThreadId);
      return;
    }

    setThreadIds(updatedThreadIds);

    if (activeThreadId === threadId) {
      setActiveThreadId(updatedThreadIds[0]);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.20),transparent_28rem),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.14),transparent_26rem)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative flex h-screen w-full overflow-hidden"
      >
        <ChatSidebar
          activeThreadId={activeThreadId}
          chats={chatHistoryQuery.data?.chats ?? []}
          threadIds={threadIds}
          isLoading={chatHistoryQuery.isLoading}
          isDesktopOpen={isDesktopSidebarOpen}
          isMobileOpen={isMobileSidebarOpen}
          onNewChat={handleNewChat}
          onSelectThread={handleSelectThread}
          onDeleteThread={handleDeleteThread}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onToggleDesktop={() => setIsDesktopSidebarOpen((prev) => !prev)}
        />

        <ChatArea
          activeThreadId={activeThreadId}
          onEnsureThread={handleEnsureThread}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onToggleDesktopSidebar={() => setIsDesktopSidebarOpen((prev) => !prev)}
        />
      </motion.div>
    </div>
  );
}