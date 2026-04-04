'use client';

// Fix #5: BackButton — goes to previous page instead of always going to '/'
// Place this file at: app/info/[slug]/BackButton.tsx

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    // If there's history, go back; otherwise fall back to home
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8 transition-colors text-sm"
    >
      <ArrowLeft size={16} /> Back
    </button>
  );
}