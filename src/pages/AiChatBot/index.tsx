import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, MoreVertical, Paperclip, Menu, X, Plus, MessageSquare } from 'lucide-react';
import type { Message,ChatSession } from '../../types/chat';
import MessageItem from '../../components/MessageItem';
import TypingIndicator from '../../components/TypingIndicator';



// --- MOCK CHAT HISTORY DATA ---
const historyData: ChatSession[] = [
  { id: 'c1', title: 'MERN Stack Auth Flow', dateGroup: 'Today' },
  { id: 'c2', title: 'Dockerizing NestJS App', dateGroup: 'Today' },
  { id: 'c3', title: 'PostgreSQL Schema Design', dateGroup: 'Yesterday' },
  { id: 'c4', title: 'React Performance Audit', dateGroup: 'Previous 7 Days' },
];

export default function AIChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: 'Core Engine online. Ready to assist with your development tasks.', timestamp: '10:00 AM' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: currentTime,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `Processing parameters for "${userMessage.text}". Integrating context...`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  // --- SIDEBAR CONTENT COMPONENT ---
  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-gray-50 border-r border-gray-200 w-64">
      {/* New Chat Button */}
      <div className="p-4">
        <button className="flex w-full items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:border-chat-accent hover:text-chat-accent transition-colors">
          <Plus size={18} />
          New Thread
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {['Today', 'Yesterday', 'Previous 7 Days'].map((group) => (
          <div key={group} className="mb-6">
            <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              {group}
            </h3>
            <div className="space-y-1">
              {historyData
                .filter((item) => item.dateGroup === group)
                .map((item) => (
                  <button
                    key={item.id}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-gray-200/50 hover:text-slate-900 transition-colors"
                  >
                    <MessageSquare size={16} className="text-gray-400" />
                    <span className="truncate text-left">{item.title}</span>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-sans text-slate-900">
      
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:block h-full">
        <SidebarContent />
      </div>

      {/* MOBILE SIDEBAR (Drawer) */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            />
            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 flex shadow-2xl md:hidden"
            >
              <SidebarContent />
              <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute -right-12 top-4 rounded-full bg-white p-2 text-slate-800 shadow-md"
              >
                <X size={20} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CHAT AREA */}
      <div className="flex flex-1 flex-col h-full bg-chat-bg relative">
        
        {/* HEADER */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-chat-bg px-4 sm:px-6 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden rounded-lg p-2 -ml-2 text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Menu size={24} />
            </button>
            
            <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-chat-ai text-slate-800 shadow-sm">
              <Sparkles size={20} className="sm:w-6 sm:h-6" />
              <span className="absolute -bottom-1 -right-1 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-chat-accent ring-4 ring-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Core Engine AI</h2>
              <p className="text-xs sm:text-sm font-medium text-chat-accent">Online</p>
            </div>
          </div>
          <button className="rounded-xl p-2 sm:p-2.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <MoreVertical size={20} />
          </button>
        </header>

        {/* MESSAGES VIEWPORT */}
        <main className="flex-1 overflow-y-auto px-2 py-4 sm:px-4 md:px-12 lg:px-24">
          <div className="mx-auto max-w-4xl w-full space-y-2">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
            </AnimatePresence>
            <div ref={messageEndRef} className="h-4" />
          </div>
        </main>

        {/* INPUT FOOTER */}
        <footer className="bg-chat-bg px-4 py-4 sm:px-6 md:px-12 lg:px-24 z-10 border-t border-gray-50">
          <div className="mx-auto max-w-4xl w-full">
            <form 
              onSubmit={handleSend} 
              className="flex items-center gap-2 rounded-2xl bg-chat-bg border-2 border-gray-100 p-1.5 focus-within:border-chat-accent focus-within:ring-4 focus-within:ring-chat-accent/10 transition-all shadow-sm"
            >
              <button
                type="button"
                className="hidden sm:block rounded-xl p-2.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <Paperclip size={20} />
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Message Core Engine..."
                className="flex-1 bg-transparent px-3 py-2 text-sm sm:text-base text-slate-900 outline-none placeholder:text-gray-400"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!inputValue.trim()}
                className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl shadow-sm transition-all ${
                  inputValue.trim()
                    ? 'bg-chat-accent text-white hover:brightness-95' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send size={18} className="ml-0.5 sm:ml-1" />
              </motion.button>
            </form>
          </div>
        </footer>

      </div>
    </div>
  );
}