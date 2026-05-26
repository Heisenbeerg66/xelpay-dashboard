'use client';

import { motion } from 'framer-motion';
import { UsageStat } from './types';

export function UsageProgress({ stat, delay = 0 }: { stat: UsageStat; delay?: number }) {
  const pct = stat.limit === 'unlimited' ? 100 : Math.min((stat.used / (stat.limit as number)) * 100, 100);
  const color = pct >= 80 ? '#ef4444' : pct >= 50 ? '#f59e0b' : '#3b82f6';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-300">{stat.name}</span>
        <span className="text-sm font-bold text-white">
          {stat.used.toLocaleString()}
          <span className="text-slate-500 font-medium"> / {stat.limit === 'unlimited' ? '∞' : (stat.limit as number).toLocaleString()}</span>
        </span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: stat.limit === 'unlimited' ? '100%' : `${pct}%` }}
          transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: stat.limit === 'unlimited' ? '#3b82f6' : color }}
        />
      </div>
      {stat.limit !== 'unlimited' && (
        <p className="text-[10px] text-slate-500">{pct.toFixed(0)}% used{pct >= 80 ? ' — consider upgrading' : ''}</p>
      )}
    </div>
  );
}
