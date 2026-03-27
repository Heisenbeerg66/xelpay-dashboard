import GatewayManagerUI from './GatewayManagerUI';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export default async function GatewaysPage() {
    const cookieStore = await cookies();
    const supabaseServer = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );
    
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();
    
    if (authError || !user) redirect('/login');

    // ক্লায়েন্ট সাইডে মার্চেন্ট আইডি পাঠানো হচ্ছে
    return <GatewayManagerUI merchantId={user.id} />;
}