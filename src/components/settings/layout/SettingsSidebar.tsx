'use client';
// src/components/settings/layout/SettingsSidebar.tsx

import React from 'react';
import {
  User, Building2, Palette, SunMoon, Bell, ShieldCheck, Code2,
  Users, MonitorSmartphone, Activity, Send, CreditCard, Sliders,
  AlertTriangle, ChevronRight, X,
} from 'lucide-react';
import { SETTINGS_NAV, type SettingsSection } from '../types';
import { cn } from '../shared/SettingsCard';

const ICON_MAP: Record<string, React.ElementType> = {
  User,
  Building2,
  Palette,
  SunMoon,
  Bell,
  ShieldCheck,
  Code2,
  Users,
  MonitorSmartphone,
  Activity,
  Send,
  CreditCard,
  Sliders,
  AlertTriangle,
};

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onSelect: (section: SettingsSection) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  merchantName?: string;
  merchantEmail?: string;
}

export function SettingsSidebar({
  activeSection,
  onSelect,
  mobileOpen,
  onMobileClose,
  merchantName,
  merchantEmail,
}: SettingsSidebarProps) {
  const mainItems = SETTINGS_NAV.filter(item => !item.danger);
  const dangerItems = SETTINGS_NAV.filter(item => item.danger);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-5 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Settings</p>
            {merchantName && (
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 truncate">{merchantName}</p>
            )}
          </div>
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {mainItems.map(item => {
          const Icon = ICON_MAP[item.icon];
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelect(item.id);
                onMobileClose?.();
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group',
                isActive
                  ? 'bg-[var(--foreground)] text-[var(--background)]'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
              )}
            >
              {Icon && (
                <Icon
                  size={15}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(
                    'shrink-0 transition-colors',
                    isActive
                      ? 'text-[var(--background)]'
                      : 'text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]'
                  )}
                />
              )}
              <div className="flex-1 min-w-0">
                <span className={cn(
                  'text-[13px] font-medium leading-none',
                  isActive ? 'font-semibold' : ''
                )}>
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <span className={cn(
                  'px-1.5 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wide',
                  isActive
                    ? 'bg-[var(--background)]/20 text-[var(--background)]'
                    : 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                )}>
                  {item.badge}
                </span>
              )}
              {isActive && (
                <ChevronRight size={12} className="text-[var(--background)]/60 shrink-0" />
              )}
            </button>
          );
        })}

        {/* Separator before Danger */}
        <div className="py-2">
          <div className="h-px bg-[var(--border)]" />
        </div>

        {dangerItems.map(item => {
          const Icon = ICON_MAP[item.icon];
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelect(item.id);
                onMobileClose?.();
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group',
                isActive
                  ? 'bg-red-600 text-white'
                  : 'text-red-500/70 dark:text-red-400/70 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400'
              )}
            >
              {Icon && (
                <Icon
                  size={15}
                  strokeWidth={2}
                  className="shrink-0"
                />
              )}
              <span className="text-[13px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[var(--border)]">
        <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">
          Settings apply to your entire XelPay account.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-[var(--border)] bg-[var(--card)] sticky top-0 h-screen overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[var(--card)] border-r border-[var(--border)] flex flex-col shadow-2xl">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
