'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step { id: number; label: string; }

export function CheckoutStepper({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                done   && 'bg-blue-600 text-white',
                active && 'bg-blue-600 text-white ring-4 ring-blue-500/20',
                !done && !active && 'bg-slate-800 text-slate-500 border border-slate-700'
              )}>
                {done ? <Check size={13} /> : step.id}
              </div>
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-widest whitespace-nowrap',
                active ? 'text-blue-400' : done ? 'text-slate-400' : 'text-slate-600'
              )}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'h-px w-12 sm:w-20 mx-2 mb-5 transition-colors',
                done ? 'bg-blue-600' : 'bg-slate-800'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
