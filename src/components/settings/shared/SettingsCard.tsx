'use client';
// src/components/settings/shared/SettingsCard.tsx
// Reusable settings card primitives — the core design system for settings-v2

import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import type { SaveState } from '../types';

// ── cn utility ──────────────────────────────────────────────────────────────
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// ── SettingsCard ─────────────────────────────────────────────────────────────
export function SettingsCard({
  children,
  className,
  danger = false,
}: {
  children: React.ReactNode;
  className?: string;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-[var(--card)] text-[var(--card-foreground)] overflow-hidden transition-all',
        danger
          ? 'border-red-200 dark:border-red-900/50'
          : 'border-[var(--border)]',
        className
      )}
    >
      {children}
    </div>
  );
}

// ── SettingsCardHeader ────────────────────────────────────────────────────────
export function SettingsCardHeader({
  title,
  description,
  action,
  icon: Icon,
  iconColor = 'text-blue-600 dark:text-blue-400',
  iconBg = 'bg-blue-50 dark:bg-blue-950/40',
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <div className="flex items-start justify-between px-6 py-5 border-b border-[var(--border)]">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={cn('mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
            <Icon size={17} className={iconColor} strokeWidth={2} />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)] tracking-tight">{title}</h3>
          {description && (
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed max-w-md">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  );
}

// ── SettingsCardBody ──────────────────────────────────────────────────────────
export function SettingsCardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('px-6 py-5', className)}>
      {children}
    </div>
  );
}

// ── SettingsCardFooter ────────────────────────────────────────────────────────
export function SettingsCardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-6 py-4 bg-[var(--muted)]/40 border-t border-[var(--border)]',
        className
      )}
    >
      {children}
    </div>
  );
}

// ── SettingsRow ───────────────────────────────────────────────────────────────
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
    <div className={cn('flex items-start justify-between gap-8 py-4 border-b border-[var(--border)] last:border-0', className)}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
        {description && (
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ── SettingsSection ────────────────────────────────────────────────────────────
export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
        {description && (
          <p className="text-sm text-[var(--muted-foreground)] mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ── FormField ─────────────────────────────────────────────────────────────────
export function FormField({
  label,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function SettingsInput({
  className,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={cn(
        'w-full px-3.5 py-2.5 rounded-xl text-sm font-medium',
        'bg-[var(--muted)]/50 border border-[var(--border)]',
        'text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]',
        'focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 focus:border-[var(--ring)]',
        'transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error && 'border-red-400 focus:ring-red-400/20',
        className
      )}
      {...props}
    />
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────
export function SettingsTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full px-3.5 py-2.5 rounded-xl text-sm font-medium resize-none',
        'bg-[var(--muted)]/50 border border-[var(--border)]',
        'text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]',
        'focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 focus:border-[var(--ring)]',
        'transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function SettingsSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl text-sm font-medium cursor-pointer',
          'bg-[var(--muted)]/50 border border-[var(--border)]',
          'text-[var(--foreground)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/20 focus:border-[var(--ring)]',
          'transition-all duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronRight
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] rotate-90 pointer-events-none"
      />
    </div>
  );
}

// ── Toggle Switch ──────────────────────────────────────────────────────────────
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
  const trackSizes = size === 'sm'
    ? 'w-8 h-4'
    : 'w-10 h-5';
  const thumbSizes = size === 'sm'
    ? 'w-3 h-3 translate-x-0.5'
    : 'w-4 h-4 translate-x-0.5';
  const thumbOn = size === 'sm'
    ? 'translate-x-4'
    : 'translate-x-5';

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
        checked
          ? 'bg-blue-600 dark:bg-blue-500'
          : 'bg-[var(--muted-foreground)]/30'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block rounded-full bg-white shadow-sm',
          'transform transition-transform duration-200 ease-in-out',
          thumbSizes,
          checked ? thumbOn : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

// ── Save Button ───────────────────────────────────────────────────────────────
export function SaveButton({
  saveState,
  onClick,
  className,
  label = 'Save changes',
}: {
  saveState: SaveState;
  onClick?: () => void;
  className?: string;
  label?: string;
}) {
  const { status } = saveState;

  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={status === 'saving'}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/30',
        status === 'saving' && 'opacity-70 cursor-not-allowed',
        status === 'saved' && 'bg-emerald-600 text-white',
        status === 'error' && 'bg-red-600 text-white',
        (status === 'idle' || !status) && 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90',
        className
      )}
    >
      {status === 'saving' && <Loader2 size={14} className="animate-spin" />}
      {status === 'saved' && <CheckCircle2 size={14} />}
      {status === 'error' && <AlertCircle size={14} />}
      {status === 'saving'
        ? 'Saving…'
        : status === 'saved'
        ? 'Saved!'
        : status === 'error'
        ? 'Failed'
        : label}
    </button>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-[var(--muted)]',
        className
      )}
    />
  );
}

// ── SkeletonCard ──────────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <SettingsCard>
      <SettingsCardHeader
        title=""
        description=""
        icon={undefined}
      />
      <SettingsCardBody>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </SettingsCardBody>
    </SettingsCard>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
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
    danger: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50',
    info: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase rounded-lg border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ── DangerButton ──────────────────────────────────────────────────────────────
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
        'border border-red-200 dark:border-red-900/50',
        'text-red-600 dark:text-red-400 bg-transparent',
        'hover:bg-red-50 dark:hover:bg-red-950/30',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}

// ── CopyButton ────────────────────────────────────────────────────────────────
export function CopyButton({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
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
          : 'bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]',
        className
      )}
    >
      {copied ? (
        <>
          <CheckCircle2 size={11} /> Copied
        </>
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

// ── SecretField ───────────────────────────────────────────────────────────────
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
        onClick={() => setVisible(v => !v)}
        className="p-2.5 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] hover:bg-[var(--accent)] transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
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
          className="p-2.5 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] hover:bg-[var(--accent)] transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-50"
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

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center mb-4">
        <Icon size={20} className="text-[var(--muted-foreground)]" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
      {description && (
        <p className="text-xs text-[var(--muted-foreground)] mt-1.5 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
