import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      {[0, 1, 2].map((item) => (
        <motion.span
          key={item}
          animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
          transition={{
            duration: 0.85,
            repeat: Infinity,
            delay: item * 0.16,
            ease: 'easeInOut',
          }}
          className="h-2 w-2 rounded-full bg-violet-200"
        />
      ))}
    </div>
  );
}