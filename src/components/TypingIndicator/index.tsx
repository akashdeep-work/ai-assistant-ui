import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const TypingIndicator = () => (
  <div className="flex w-full items-end gap-3 p-4 justify-start">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chat-ai text-slate-800 shadow-sm">
      <Bot size={18} />
    </div>
    <div className="bg-chat-ai rounded-2xl rounded-bl-none px-5 py-4 shadow-sm">
      <div className="flex gap-1.5 items-center h-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            className="h-2 w-2 rounded-full bg-slate-700"
          />
        ))}
      </div>
    </div>
  </div>
);

export default TypingIndicator