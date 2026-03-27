import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ createClient এর বদলে createBrowserClient ব্যবহার করা হয়েছে, যা কুকি ম্যানেজ করবে
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);