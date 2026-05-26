'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { USAGE_CHART_DATA } from './types';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-3 shadow-xl text-sm">
        <p className="font-bold text-slate-300 mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.stroke }} className="font-semibold">
            {p.name}: {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function UsageChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={USAGE_CHART_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="gTx" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gApi" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569', fontWeight: 700 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="transactions" name="Transactions" stroke="#3b82f6" strokeWidth={2} fill="url(#gTx)" dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
        <Area type="monotone" dataKey="apiCalls"     name="API Calls"    stroke="#8b5cf6" strokeWidth={2} fill="url(#gApi)" dot={false} activeDot={{ r: 4, fill: '#8b5cf6' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
