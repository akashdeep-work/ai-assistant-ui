import { motion } from 'framer-motion';
import { Activity, WifiOff } from 'lucide-react';
import { useHealthCheck } from '../../hooks/useHealthCheck';

export default function HealthStatus() {
  const { isSuccess, isFetching, isError } = useHealthCheck();

  const label = isSuccess ? 'API online' : isFetching ? 'Checking API' : 'API offline';
  const tone = isSuccess ? 'bg-emerald-400' : isError ? 'bg-red-400' : 'bg-amber-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300"
      title={label}
    >
      {isError ? <WifiOff size={14} /> : <Activity size={14} />}
      <span className={`h-2 w-2 rounded-full ${tone}`} />
      {label}
    </motion.div>
  );
}