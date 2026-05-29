import { memo } from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import type { Message } from '../../types/chat';

const MessageItem = memo(({ message }: { message: Message }) => {
  const isAI = message.sender === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex w-full items-end gap-3 p-4 ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      {isAI && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chat-ai text-slate-800 shadow-sm">
          <Bot size={18} />
        </div>
      )}
      
      <div
        className={`relative max-w-[75%] rounded-2xl px-5 py-3 text-sm shadow-sm md:max-w-[65%] ${
          isAI
            ? 'bg-chat-ai text-slate-900 rounded-bl-none'
            : 'bg-chat-user text-slate-900 rounded-br-none'
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed font-medium">{message.text}</p>
        <span className="block mt-1.5 text-[10px] text-right opacity-70 font-semibold">
          {message.timestamp}
        </span>
      </div>

      {!isAI && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chat-user text-slate-800 shadow-sm">
          <User size={18} />
        </div>
      )}
    </motion.div>
  );
});

export default MessageItem;


