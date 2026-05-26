'use client';

import { motion } from 'framer-motion';
import { Trash2, Star, CreditCard, Smartphone } from 'lucide-react';
import { PaymentMethod } from './types';
import { cn } from '@/lib/utils';

const METHOD_COLORS: Record<string, string> = {
  card: '#3b82f6', bkash: '#e2136e', nagad: '#f05a23',
  rocket: '#8b5cf6', bank: '#3b82f6', crypto: '#f7931a',
};

export function PaymentMethodCard({
  method, onDelete, onSetDefault, delay = 0,
}: {
  method: PaymentMethod;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  delay?: number;
}) {
  const color = METHOD_COLORS[method.type] || '#3b82f6';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={cn(
        'flex items-center justify-between p-4 rounded-xl border transition-all',
        method.isDefault
          ? 'border-blue-500/30 bg-blue-500/5'
          : 'border-slate-800 bg-slate-800/30 hover:bg-slate-800/60'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30` }}>
          {method.type === 'card' ? <CreditCard size={16} style={{ color }} /> : <Smartphone size={16} style={{ color }} />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">{method.label}</span>
            {method.isDefault && (
              <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">Default</span>
            )}
          </div>
          <span className="text-xs text-slate-500">{method.detail}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {!method.isDefault && onSetDefault && (
          <button onClick={() => onSetDefault(method.id)} className="p-2 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-blue-400 transition-colors" title="Set as default">
            <Star size={14} />
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(method.id)} className="p-2 rounded-lg hover:bg-red-900/20 text-slate-500 hover:text-red-400 transition-colors">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
