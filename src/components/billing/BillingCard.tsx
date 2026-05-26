'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BillingCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export function BillingCard({ children, className, hover = false, delay = 0 }: BillingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hover ? { y: -2 } : undefined}
      className={cn(
        'bg-[#111827] rounded-2xl border border-slate-800/80',
        hover && 'cursor-pointer transition-all',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
