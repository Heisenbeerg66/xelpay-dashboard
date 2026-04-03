import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Next.js ডেভেলপমেন্ট মোডে HMR এর কারণে যাতে বারবার 
// নতুন ক্লায়েন্ট তৈরি না হয়, তার জন্য globalThis ব্যবহার করা হলো
const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createBrowserClient> | undefined;
};

// যদি আগে থেকে ক্লায়েন্ট তৈরি করা থাকে, তবে সেটিই ব্যবহার করবে, নাহলে নতুন করে তৈরি করবে
export const supabase =
  globalForSupabase.supabase ?? createBrowserClient(supabaseUrl, supabaseKey);

// শুধুমাত্র ডেভেলপমেন্ট এনভায়রনমেন্টের জন্য ক্লায়েন্টটিকে সেভ করে রাখা হচ্ছে
if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.supabase = supabase;
}