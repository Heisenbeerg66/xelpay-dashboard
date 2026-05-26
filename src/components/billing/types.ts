export type PlanId = 'starter' | 'pro' | 'enterprise';
export type BillingCycle = 'monthly' | 'yearly';
export type InvoiceStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type PaymentMethodType = 'card' | 'bkash' | 'nagad' | 'rocket' | 'bank' | 'crypto';

export interface Plan {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  limits: {
    transactions: number | 'unlimited';
    teamMembers: number | 'unlimited';
    gateways: number | 'unlimited';
    apiCalls: number | 'unlimited';
  };
  popular?: boolean;
  color: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  plan: string;
  period: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  detail: string;
  isDefault: boolean;
  addedAt: string;
}

export interface UsageStat {
  name: string;
  used: number;
  limit: number | 'unlimited';
  unit: string;
}

export interface BillingHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: InvoiceStatus;
  method: string;
}

// ─── Mock Data ────────────────────────────────────────────────

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Perfect for individuals getting started.',
    color: '#64748b',
    limits: { transactions: 100, teamMembers: 1, gateways: 2, apiCalls: 1000 },
    features: [
      '100 transactions/month',
      '1 team member',
      '2 payment gateways',
      '1,000 API calls/month',
      'Basic analytics',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 29,
    yearlyPrice: 290,
    description: 'For growing businesses that need more power.',
    color: '#3b82f6',
    popular: true,
    limits: { transactions: 5000, teamMembers: 10, gateways: 10, apiCalls: 50000 },
    features: [
      '5,000 transactions/month',
      '10 team members',
      '10 payment gateways',
      '50,000 API calls/month',
      'Advanced analytics',
      'Priority support',
      'Custom webhook',
      'Telegram alerts',
      'PDF invoices',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 99,
    yearlyPrice: 990,
    description: 'Unlimited scale for high-volume businesses.',
    color: '#8b5cf6',
    limits: { transactions: 'unlimited', teamMembers: 'unlimited', gateways: 'unlimited', apiCalls: 'unlimited' },
    features: [
      'Unlimited transactions',
      'Unlimited team members',
      'Unlimited gateways',
      'Unlimited API calls',
      'Enterprise analytics',
      '24/7 dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'White-label option',
      'Custom contracts',
    ],
  },
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv_001',
    invoiceNumber: 'INV-2026-001',
    date: '2026-05-01',
    dueDate: '2026-05-15',
    amount: 29,
    status: 'paid',
    plan: 'Pro',
    period: 'May 2026',
    items: [{ description: 'Pro Plan - Monthly Subscription', quantity: 1, unitPrice: 29, total: 29 }],
  },
  {
    id: 'inv_002',
    invoiceNumber: 'INV-2026-002',
    date: '2026-04-01',
    dueDate: '2026-04-15',
    amount: 29,
    status: 'paid',
    plan: 'Pro',
    period: 'April 2026',
    items: [{ description: 'Pro Plan - Monthly Subscription', quantity: 1, unitPrice: 29, total: 29 }],
  },
  {
    id: 'inv_003',
    invoiceNumber: 'INV-2026-003',
    date: '2026-03-01',
    dueDate: '2026-03-15',
    amount: 29,
    status: 'paid',
    plan: 'Pro',
    period: 'March 2026',
    items: [{ description: 'Pro Plan - Monthly Subscription', quantity: 1, unitPrice: 29, total: 29 }],
  },
  {
    id: 'inv_004',
    invoiceNumber: 'INV-2026-004',
    date: '2026-02-01',
    dueDate: '2026-02-15',
    amount: 29,
    status: 'refunded',
    plan: 'Pro',
    period: 'February 2026',
    items: [{ description: 'Pro Plan - Monthly Subscription', quantity: 1, unitPrice: 29, total: 29 }],
  },
];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm_001', type: 'card',  label: 'Visa •••• 4242',    detail: 'Expires 12/27', isDefault: true,  addedAt: '2025-01-15' },
  { id: 'pm_002', type: 'bkash', label: 'bKash',             detail: '+880 1712-345678', isDefault: false, addedAt: '2025-03-20' },
  { id: 'pm_003', type: 'nagad', label: 'Nagad',             detail: '+880 1987-654321', isDefault: false, addedAt: '2025-04-10' },
];

export const MOCK_USAGE: UsageStat[] = [
  { name: 'Transactions', used: 3241, limit: 5000,  unit: 'transactions' },
  { name: 'API Calls',    used: 38200, limit: 50000, unit: 'calls' },
  { name: 'Team Members', used: 4,    limit: 10,    unit: 'members' },
  { name: 'Gateways',     used: 6,    limit: 10,    unit: 'gateways' },
];

export const MOCK_HISTORY: BillingHistoryItem[] = [
  { id: 'bh_001', date: '2026-05-01', description: 'Pro Plan - May 2026',      amount: 29, status: 'paid',     method: 'Visa •••• 4242' },
  { id: 'bh_002', date: '2026-04-01', description: 'Pro Plan - April 2026',    amount: 29, status: 'paid',     method: 'Visa •••• 4242' },
  { id: 'bh_003', date: '2026-03-01', description: 'Pro Plan - March 2026',    amount: 29, status: 'paid',     method: 'Visa •••• 4242' },
  { id: 'bh_004', date: '2026-02-01', description: 'Pro Plan - Feb 2026',      amount: 29, status: 'refunded', method: 'Visa •••• 4242' },
  { id: 'bh_005', date: '2026-01-01', description: 'Pro Plan - Jan 2026',      amount: 29, status: 'paid',     method: 'bKash' },
];

export const USAGE_CHART_DATA = [
  { month: 'Dec', transactions: 1200, apiCalls: 18000 },
  { month: 'Jan', transactions: 1800, apiCalls: 22000 },
  { month: 'Feb', transactions: 2200, apiCalls: 28000 },
  { month: 'Mar', transactions: 2800, apiCalls: 33000 },
  { month: 'Apr', transactions: 3100, apiCalls: 36000 },
  { month: 'May', transactions: 3241, apiCalls: 38200 },
];
