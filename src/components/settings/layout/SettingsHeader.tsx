'use client';
// src/components/settings/layout/SettingsHeader.tsx

import React from 'react';
import { Menu, ArrowLeft } from 'lucide-react';
import { SETTINGS_NAV, type SettingsSection } from '../types';
import { cn } from '../shared/SettingsCard';

interface SettingsHeaderProps {
  activeSection: SettingsSection;
  onMenuOpen: () => void;
  onBack?: () => void;
}

export function SettingsHeader({ activeSection, onMenuOpen, onBack }: SettingsHeaderProps) {
  const item = SETTINGS_NAV.find(n => n.id === activeSection);

  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuOpen}
        className="lg:hidden p-2 rounded-xl hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft size={14} />
            <span className="text-xs font-medium">Settings</span>
          </button>
        )}
        {onBack && <span className="text-[var(--muted-foreground)]">/</span>}
        <span className="text-sm font-semibold text-[var(--foreground)] truncate">
          {item?.label ?? 'Settings'}
        </span>
        {item?.description && (
          <span className="hidden sm:block text-xs text-[var(--muted-foreground)] truncate">
            — {item.description}
          </span>
        )}
      </div>
    </div>
  );
}
