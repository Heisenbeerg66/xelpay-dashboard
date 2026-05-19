'use client';

// src/components/settings/shared/SettingsCard.tsx
// Unified API — supports ALL 14 section files without changes

import React from 'react';
import { ChevronRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

// ─── SaveState: supports BOTH string union AND object form ────────────────────
// Old sections: useState<SaveState>({ status: 'idle' }) → SaveButton saveState={obj}
// New sections: useState<SaveState>('idle')             → SaveButton state={str}
export type SaveState = 'idle' | 'saving' | 'saved' | 'error' | {
  status: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
};

// Helper to normalise either form to a plain string
function getStatus(s: SaveState): 'idle' | 'saving' | 'saved' | 'error' {
  if (typeof s === 'string') return s;
  return s.status;
}

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// ─── SettingsCard ─────────────────────────────────────────────────────────────
export function SettingsCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden', className)}>
      {children}
    </div>
  );
}

// ─── SettingsCardHeader ───────────────────────────────────────────────────────
// Supports: icon, iconColor, iconBg, title, description, action
export function SettingsCardHeader({
  title,
  description,
  action,
  icon: Icon,
  iconColor,
  iconBg,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[var(--border)]">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', iconBg || 'bg-[var(--muted)]')}>
            <Icon size={16} className={iconColor || 'text-[var(--muted-foreground)]'} />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
          {description && (
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ─── SettingsCardBody ─────────────────────────────────────────────────────────
export function SettingsCardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('px-6 py-5 space-y-4', className)}>
      {children}
    </div>
  );
}

// ─── SettingsCardFooter ───────────────────────────────────────────────────────
export function SettingsCardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('px-6 py-4 border-t border-[var(--border)] bg-[var(--muted)]/40 flex items-center gap-3', className)}>
      {children}
    </div>
  );
}

// ─── SettingsRow ──────────────────────────────────────────────────────────────
export function SettingsRow({
  label,
  description,
  children,
  className,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-6 py-1', className)}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
        {description && (
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// ─── SettingsSection ──────────────────────────────────────────────────────────
// title is optional — new sections call <SettingsSection> with no props
export function SettingsSection({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {title && (
        <div>
          <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
          {description && (
            <p className="text-sm text-[var(--muted-foreground)] mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── FormField ────────────────────────────────────────────────────────────────
export function FormField({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-xs font-semibold text-[var(--foreground)] uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── SettingsInput ────────────────────────────────────────────────────────────
// Supports BOTH:
//   onChange={(v: string) => ...}   ← new sections (string)
//   onChange={set('field')}          ← old sections (returns (e) => void)
// We detect the arity: if it returns a function, it's the old curried form.
// Simplest approach: accept React.InputHTMLAttributes AND our custom onChange.
export function SettingsInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
  required,
  className,
  error,
  readOnly,
  ...rest
}: {
  value?: string | number;
  onChange?: ((v: string) => void) | React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: boolean;
  readOnly?: boolean;
  [key: string]: any;
}) {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!onChange) return;
    // Call with string value directly — works for both (v: string) => void
    // and (e: ChangeEvent) => void since string is passed in both cases
    (onChange as any)(e.target.value);
  };

  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      readOnly={readOnly}
      className={cn(
        'w-full px-3.5 py-2.5 rounded-xl text-sm font-medium',
        'bg-[var(--muted)]/50 border border-[var(--border)]',
        'text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]',
        'focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 focus:border-[var(--ring)]',
        'transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error && 'border-red-400 focus:ring-red-400/20',
        className,
      )}
      {...rest}
    />
  );
}

// ─── SettingsTextarea ─────────────────────────────────────────────────────────
export function SettingsTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled,
  className,
}: {
  value?: string;
  onChange?: ((v: string) => void) | React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <textarea
      value={value ?? ''}
      onChange={(e) => onChange && (onChange as any)(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={cn(
        'w-full px-3.5 py-2.5 rounded-xl text-sm font-medium resize-none',
        'bg-[var(--muted)]/50 border border-[var(--border)]',
        'text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]',
        'focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 focus:border-[var(--ring)]',
        'transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
    />
  );
}

// ─── SettingsSelect ───────────────────────────────────────────────────────────
// Supports BOTH:
//   options={[{value, label}]} + onChange={(v: string) => ...}  ← new sections
//   children={<option>...}    + onChange={set('field')}          ← old sections
export function SettingsSelect({
  value,
  onChange,
  options,
  children,
  disabled,
  className,
}: {
  value?: string;
  onChange?: ((v: string) => void) | React.ChangeEventHandler<HTMLSelectElement>;
  options?: { value: string; label: string }[];
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value ?? ''}
        onChange={(e) => onChange && (onChange as any)(e.target.value)}
        disabled={disabled}
        className={cn(
          'w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl text-sm font-medium cursor-pointer',
          'bg-[var(--muted)]/50 border border-[var(--border)] text-[var(--foreground)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 focus:border-[var(--ring)]',
          'transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        )}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))
          : children}
      </select>
      <ChevronRight
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] rotate-90 pointer-events-none"
      />
    </div>
  );
}

// ─── SettingsToggle ───────────────────────────────────────────────────────────
export function SettingsToggle({
  checked,
  onChange,
  disabled,
  label,
  size = 'md',
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}) {
  const trackSizes = size === 'sm' ? 'w-8 h-4' : 'w-10 h-5';
  const thumbSizes = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const thumbOn   = size === 'sm' ? 'translate-x-4' : 'translate-x-5';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 rounded-full border-2 border-transparent',
        'transition-colors duration-200 ease-in-out cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/30',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        trackSizes,
        checked ? 'bg-blue-600 dark:bg-blue-500' : 'bg-[var(--muted-foreground)]/30',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block rounded-full bg-white shadow-sm',
          'transform transition-transform duration-200 ease-in-out',
          thumbSizes,
          checked ? thumbOn : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

// ─── SaveButton ───────────────────────────────────────────────────────────────
// Supports BOTH:
//   state={saveState}    ← new sections (string)
//   saveState={saveState} ← old sections (object or string)
export function SaveButton({
  state,
  saveState,
  onClick,
  className,
  label = 'Save changes',
}: {
  state?: SaveState;
  saveState?: SaveState;
  onClick?: () => void;
  className?: string;
  label?: string;
}) {
  const raw = state ?? saveState ?? 'idle';
  const status = getStatus(raw);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={status === 'saving'}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/30',
        status === 'saving' && 'opacity-70 cursor-not-allowed bg-[var(--foreground)] text-[var(--background)]',
        status === 'saved'  && 'bg-emerald-600 text-white',
        status === 'error'  && 'bg-red-600 text-white',
        status === 'idle'   && 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90',
        className,
      )}
    >
      {status === 'saving' && <Loader2    size={14} className="animate-spin" />}
      {status === 'saved'  && <CheckCircle2 size={14} />}
      {status === 'error'  && <AlertCircle  size={14} />}
      {status === 'saving' ? 'Saving…'
        : status === 'saved'  ? 'Saved!'
        : status === 'error'  ? 'Failed'
        : label}
    </button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-[var(--muted)]', className)} />;
}

// ─── SkeletonCard ─────────────────────────────────────────────────────────────
// Accepts optional rows — new sections use <SkeletonCard rows={3} />
export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <SettingsCard>
      <SettingsCardHeader title="" />
      <SettingsCardBody>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className={cn('h-10', i % 3 === 1 ? 'w-3/4' : 'w-full')} />
          ))}
        </div>
      </SettingsCardBody>
    </SettingsCard>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}) {
  const variants = {
    default: 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
    danger:  'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50',
    info:    'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase rounded-lg border', variants[variant], className)}>
      {children}
    </span>
  );
}

// ─── DangerButton ─────────────────────────────────────────────────────────────
export function DangerButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
        'border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 bg-transparent',
        'hover:bg-red-50 dark:hover:bg-red-950/30',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
    >
      {children}
    </button>
  );
}

// ─── CopyButton ───────────────────────────────────────────────────────────────
// Accepts both `text` (new) and `value` (old)
export function CopyButton({
  text,
  value,
  className,
}: {
  text?: string;
  value?: string;
  className?: string;
}) {
  const content = text ?? value ?? '';
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
        copied
          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
          : 'bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)] hover:bg-[var(--muted)]/80 hover:text-[var(--foreground)]',
        className,
      )}
    >
      {copied ? (
        <><CheckCircle2 size={11} /> Copied</>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

// ─── SecretField ──────────────────────────────────────────────────────────────
export function SecretField({
  value,
  label,
  onRegenerate,
  regenerating,
}: {
  value: string;
  label: string;
  onRegenerate?: () => void;
  regenerating?: boolean;
}) {
  const [visible, setVisible] = React.useState(false);
  const masked = value.slice(0, 8) + '••••••••••••••••';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center px-3.5 py-2.5 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] min-w-0">
        <code className="text-xs font-mono text-[var(--foreground)] truncate flex-1">
          {visible ? value : masked}
        </code>
      </div>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="p-2.5 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        title={visible ? 'Hide' : 'Show'}
      >
        {visible ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
      <CopyButton value={value} />
      {onRegenerate && (
        <button
          type="button"
          onClick={onRegenerate}
          disabled={regenerating}
          className="p-2.5 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] hover:bg-[var(--muted)] transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-50"
          title="Regenerate"
        >
          {regenerating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
// icon accepts BOTH:
//   icon={<AlertTriangle size={24} />}  ← new sections (ReactNode/JSX)
//   icon={Users}                        ← old sections (ElementType/component)
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode | React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const isComponent = typeof icon === 'function' || (typeof icon === 'object' && icon !== null && !React.isValidElement(icon));
  const IconEl = isComponent ? (icon as React.ElementType) : null;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center mb-4">
        {IconEl
          ? <IconEl size={20} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
          : icon as React.ReactNode}
      </div>
      <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
      {description && (
        <p className="text-xs text-[var(--muted-foreground)] mt-1.5 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}