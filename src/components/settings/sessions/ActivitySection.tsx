'use client';
// src/components/settings/sessions/ActivitySection.tsx

import React, { useState, useEffect } from 'react';
import {
  Activity, Filter, RefreshCw, Shield, Key, Settings2,
  User, Building2, CreditCard, Bell, ChevronDown,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  SettingsCard, SettingsCardHeader, SettingsCardBody, SettingsCardFooter,
  SettingsSection, Badge, EmptyState, cn,
} from '../shared/SettingsCard';
import type { MerchantProfile } from '../types';

interface LogEntry {
  id: string;
  action: string;
  category: string;
  description: string | null;
  ip_address: string | null;
  created_at: string;
  metadata: Record<string, any>;
}

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  security:  { icon: Shield, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', label: 'Security' },
  api:       { icon: Key, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', label: 'API' },
  settings:  { icon: Settings2, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30', label: 'Settings' },
  profile:   { icon: User, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', label: 'Profile' },
  business:  { icon: Building2, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', label: 'Business' },
  payment:   { icon: CreditCard, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/30', label: 'Payment' },
  general:   { icon: Activity, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/50', label: 'General' },
};

function timeFormat(date: string) {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

interface ActivitySectionProps {
  merchant: MerchantProfile;
}

export function ActivitySection({ merchant }: ActivitySectionProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    loadLogs();
  }, [filter, page]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('merchant_activity_log')
        .select('id,action,category,description,ip_address,created_at,metadata')
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (filter !== 'all') {
        query = query.eq('category', filter);
      }

      const { data } = await query;
      if (data) setLogs(data as LogEntry[]);
    } catch {
      // Fallback to audit_logs if activity table is empty
      const { data } = await supabase
        .from('audit_logs')
        .select('id,action,details,ip_address,created_at')
        .eq('user_id', merchant.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setLogs(data.map((d: { id: any; action: any; ip_address: any; created_at: any; details: any; }) => ({
          id: d.id,
          action: d.action,
          category: 'general',
          description: null,
          ip_address: d.ip_address,
          created_at: d.created_at,
          metadata: d.details ?? {},
        })));
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = Object.keys(CATEGORY_CONFIG);

  return (
    <SettingsSection
      title="Activity Logs"
      description="Audit trail of all significant actions on your account."
    >
      <SettingsCard>
        <SettingsCardHeader
          icon={Activity}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
          title="Recent Activity"
          description="Last 30 days of account activity."
          action={
            <button
              onClick={loadLogs}
              disabled={loading}
              className="p-2 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          }
        />

        {/* Filter Tabs */}
        <div className="px-6 pt-4 pb-0 flex items-center gap-2 flex-wrap border-b border-[var(--border)] pb-3">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              filter === 'all'
                ? 'bg-[var(--foreground)] text-[var(--background)]'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
            )}
          >
            All
          </button>
          {categories.map(cat => {
            const cfg = CATEGORY_CONFIG[cat];
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize',
                  filter === cat
                    ? 'bg-[var(--foreground)] text-[var(--background)]'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
                )}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        <SettingsCardBody className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-[var(--muted)] shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-48 bg-[var(--muted)] rounded" />
                    <div className="h-2.5 w-32 bg-[var(--muted)] rounded" />
                  </div>
                  <div className="h-2.5 w-20 bg-[var(--muted)] rounded" />
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No activity found"
              description="Actions you take on your account will appear here."
            />
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {logs.map(log => {
                const cat = CATEGORY_CONFIG[log.category] ?? CATEGORY_CONFIG.general;
                const Icon = cat.icon;
                return (
                  <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-[var(--muted)]/20 transition-colors">
                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', cat.bg)}>
                      <Icon size={14} className={cat.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] capitalize">
                        {log.action.replace(/_/g, ' ')}
                      </p>
                      {log.description && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{log.description}</p>
                      )}
                      {log.ip_address && (
                        <p className="text-[11px] text-[var(--muted-foreground)] mt-1">IP: {log.ip_address}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] text-[var(--muted-foreground)] whitespace-nowrap">
                        {timeFormat(log.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SettingsCardBody>

        {logs.length === PAGE_SIZE && (
          <SettingsCardFooter>
            <div />
            <button
              onClick={() => setPage(p => p + 1)}
              className="text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
            >
              Load more <ChevronDown size={12} />
            </button>
          </SettingsCardFooter>
        )}
      </SettingsCard>
    </SettingsSection>
  );
}
