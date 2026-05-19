// src/components/settings/types.ts
// Shared types for the settings V2 system

export type SettingsSection =
  | 'profile'
  | 'business'
  | 'branding'
  | 'appearance'
  | 'notifications'
  | 'security'
  | 'api'
  | 'team'
  | 'sessions'
  | 'activity'
  | 'telegram'
  | 'payment'
  | 'advanced'
  | 'danger';

export interface SettingsNavItem {
  id: SettingsSection;
  label: string;
  description: string;
  icon: string; // lucide icon name
  badge?: string;
  danger?: boolean;
}

export const SETTINGS_NAV: SettingsNavItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    description: 'Your personal info & avatar',
    icon: 'User',
  },
  {
    id: 'business',
    label: 'Business',
    description: 'Business details & contact',
    icon: 'Building2',
  },
  {
    id: 'branding',
    label: 'Branding',
    description: 'Logo, colors & appearance',
    icon: 'Palette',
  },
  {
    id: 'appearance',
    label: 'Appearance',
    description: 'Theme, density & display',
    icon: 'SunMoon',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Email, push & Telegram alerts',
    icon: 'Bell',
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Password, 2FA & login history',
    icon: 'ShieldCheck',
  },
  {
    id: 'api',
    label: 'API & Webhooks',
    description: 'Keys, endpoints & secrets',
    icon: 'Code2',
  },
  {
    id: 'team',
    label: 'Team & Roles',
    description: 'Members, invites & permissions',
    icon: 'Users',
  },
  {
    id: 'sessions',
    label: 'Devices & Sessions',
    description: 'Active sessions & trusted devices',
    icon: 'MonitorSmartphone',
  },
  {
    id: 'activity',
    label: 'Activity Logs',
    description: 'Audit trail & account history',
    icon: 'Activity',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    description: 'Bot alerts & notifications',
    icon: 'Send',
  },
  {
    id: 'payment',
    label: 'Payment Preferences',
    description: 'Currency, gateways & limits',
    icon: 'CreditCard',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Developer options & integrations',
    icon: 'Sliders',
  },
  {
    id: 'danger',
    label: 'Danger Zone',
    description: 'Delete account & data',
    icon: 'AlertTriangle',
    danger: true,
  },
];

export interface MerchantProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  favicon_url?: string;
  website?: string;
  currency: string;
  exchange_rate: number;
  webhook_url?: string;
  status: string;
  brand_name?: string;
  secret_key?: string;
  redirect_url?: string;
  telegram_chat_id?: string;
  telegram_link_code?: string;
  webhook_secret?: string;
  active_business_id?: string;
  subscription_status?: string;
  plan_id?: string;
  timezone?: string;
  language?: string;
  support_email?: string;
  two_factor_enabled?: boolean;
  login_notification_email?: boolean;
  created_at?: string;
}

export interface NotificationPrefs {
  email_new_payment: boolean;
  email_payment_failed: boolean;
  email_daily_summary: boolean;
  email_weekly_report: boolean;
  email_security_alerts: boolean;
  email_team_invites: boolean;
  email_subscription: boolean;
  push_new_payment: boolean;
  push_payment_failed: boolean;
  push_security_alerts: boolean;
  telegram_new_payment: boolean;
  telegram_payment_failed: boolean;
  telegram_daily_summary: boolean;
}

export interface AppearancePrefs {
  theme: 'light' | 'dark' | 'system';
  accent_color: string;
  sidebar_style: 'expanded' | 'compact' | 'icon';
  density: 'comfortable' | 'compact' | 'cozy';
  font_size: 'sm' | 'md' | 'lg';
}

export type SaveState = 'idle' | 'saving' | 'saved' | 'error' | { status: 'idle' | 'saving' | 'saved' | 'error'; message?: string };

export type Role = 'admin' | 'developer' | 'support' | 'viewer';

export interface TeamMember {
  id: string;
  business_id: string;
  user_id: string;
  role: Role;
  created_at: string;
  email?: string;
}

export interface Invitation {
  id: string;
  business_id: string;
  email: string;
  role: Role;
  status: 'pending' | 'accepted' | 'revoked';
  created_at: string;
  resend_count?: number;
  last_resent_at?: string | null;
  expires_at?: string | null;
}