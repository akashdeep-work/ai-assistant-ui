import { memo } from 'react';
import { motion } from 'framer-motion';
import { Bot, CircleAlert, User } from 'lucide-react';
import type { UiMessage } from '../../types/chat.types';
import TypingIndicator from '../TypingIndicator';

interface MessageItemProps {
  message: UiMessage;
}

function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';
  const isStreamingWithoutText = message.status === 'streaming' && !message.content;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className={`flex w-full items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-violet-500 text-white shadow-lg shadow-violet-950/30">
          {isError ? <CircleAlert size={18} /> : <Bot size={18} />}
        </div>
      )}

      <div
        className={`max-w-[86%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 shadow-xl md:max-w-[70%] ${
          isUser
            ? 'rounded-br-md bg-white text-slate-950 shadow-black/10'
            : isError
              ? 'rounded-bl-md border border-red-400/20 bg-red-500/10 text-red-100'
              : 'rounded-bl-md border border-white/10 bg-white/[0.07] text-slate-100 shadow-black/20 backdrop-blur-xl'
        }`}
      >
        {isStreamingWithoutText ? (
          <TypingIndicator />
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}
      </div>

      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-slate-900 shadow-lg shadow-black/10">
          <User size={18} />
        </div>
      )}
    </motion.article>
  );
}

export default memo(MessageItem);