'use client';
// PATH: /components/dashboard/LogoutButton.tsx
// DashboardClient এর sidebar বা header এ এই component import করে use করো।
// কোনো API route লাগবে না — Server Action দিয়ে কাজ করে।

import { logoutAction } from '@/lib/session';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

interface Props {
  // Optional — তোমার DashboardClient এর existing styling এর সাথে match করাতে পারবে
  className?: string;
  showIcon?: boolean;
  label?: string;
}

export default function LogoutButton({
  className = 'flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10',
  showIcon = true,
  label = 'Logout',
}: Props) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async () => {
        setPending(true);
        await logoutAction(); // → server action → cookie delete → redirect('/')
      }}
    >
      <button type="submit" disabled={pending} className={`${className} disabled:opacity-50`}>
        {showIcon && <LogOut size={16} />}
        {pending ? 'Logging out…' : label}
      </button>
    </form>
  );
}

// ─── HOW TO USE in DashboardClient/Sidebar ────────────────────────────────
// import LogoutButton from '@/components/dashboard/LogoutButton';
//
// // Simple usage:
// <LogoutButton />
//
// // Custom styling:
// <LogoutButton
//   label="Sign Out"
//   className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
// />