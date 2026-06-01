import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onPromptClick: (prompt: string) => void;
}

const suggestions = [
  'Summarize the uploaded document in bullet points.',
  'Create a concise project plan for this feature.',
  'Explain this API response like a senior engineer.',
];

export default function EmptyState({ onPromptClick }: EmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-2xl text-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-300/20 bg-violet-500/20 shadow-2xl shadow-violet-950/40"
        >
          <Bot size={36} className="text-violet-200" />
        </motion.div>

        <h1 className="mt-7 text-3xl font-bold tracking-tight text-white md:text-5xl">
          Ask your AI assistant
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 md:text-base">
          Upload files, ask follow-up questions, and stream answers in real time with a clean
          production-ready chat flow.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onPromptClick(suggestion)}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left text-sm text-slate-300 transition hover:border-violet-300/40 hover:bg-violet-500/10 hover:text-white"
            >
              <Sparkles size={16} className="mb-3 text-violet-300 transition group-hover:scale-110" />
              {suggestion}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}