'use client';
import { supabase } from '@/lib/supabase';

export default function SocialAuth() {
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    await supabase.auth.signInWithOAuth({ provider });
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <button onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-bold text-sm text-slate-600">
        Google
      </button>
      <button onClick={() => handleSocialLogin('facebook')} className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-bold text-sm text-slate-600">
        Facebook
      </button>
    </div>
  );
}