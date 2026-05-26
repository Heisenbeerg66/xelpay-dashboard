'use client';

import { cn } from '@/lib/utils';

interface PlanBadgeProps {
  plan: string;
  className?: string;
  size?: 'sm' | 'md';
}

const PLAN_STYLES: Record<string, string> = {
  starter:    'bg-slate-700/60 text-slate-300',
  pro:        'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  enterprise: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
};

export function PlanBadge({ plan, className, size = 'sm' }: PlanBadgeProps) {
  const key = plan.toLowerCase();
  const style = PLAN_STYLES[key] || PLAN_STYLES.starter;
  return (
    <span className={cn(
      'inline-flex items-center font-bold rounded-full uppercase tracking-widest',
      size === 'sm' ? 'text-[10px] px-2.5 py-0.5' : 'text-xs px-3 py-1',
      style,
      className
    )}>
      {plan}
    </span>
  );
}
