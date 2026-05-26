'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Stat {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  color: string;
}

export function BillingStats({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#111827] rounded-2xl border border-slate-800/80 p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}18` }}>
              <s.icon size={15} style={{ color: s.color }} />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{s.value}</p>
          {s.sub && <p className="text-xs text-slate-500 mt-1">{s.sub}</p>}
        </motion.div>
      ))}
    </div>
  );
}
