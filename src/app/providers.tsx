'use client';
// src/app/providers.tsx
// ─────────────────────────────────────────────────────────────────────────────
// MODIFIED: Added ThemeProvider from next-themes
// PRESERVED: All existing provider logic
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { ThemeProvider } from 'next-themes';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"          // Uses className="dark" on <html> — same as existing XelPay approach
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="xelpay-theme"  // Namespaced to avoid conflicts
    >
      {children}
    </ThemeProvider>
  );
}