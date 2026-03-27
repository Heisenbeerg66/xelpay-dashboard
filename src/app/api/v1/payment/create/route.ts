import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const headerList = headers();
    // ✅ TypeScript ফিক্স: authorization চেক
    const authHeader = (await headerList).get('authorization') || ""; 

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: "Unauthorized: Invalid API Key format." }, { status: 401 });
    }

    const secretKey = authHeader.split(' ')[1];

    const { data: merchant, error: mError } = await supabase
      .from('merchants').select('id, is_demo, brand_name').eq('secret_key', secretKey).single();

    if (mError || !merchant) {
      return NextResponse.json({ success: false, message: "Forbidden: API Key not found." }, { status: 403 });
    }

    if (merchant.is_demo) {
      return NextResponse.json({ success: false, message: "Action Denied: Your account is in Demo mode." }, { status: 403 });
    }

    const body = await req.json();
    const { amount, order_id, product_name, customer_name, customer_email, customer_phone, redirect_url, currency } = body;

    const { data: existingOrder } = await supabase.from('orders').select('id')
      .eq('merchant_id', merchant.id).eq('order_no', order_id).single();

    if (existingOrder) return NextResponse.json({ success: false, message: "Order ID already exists." }, { status: 409 });

    const { error: orderError } = await supabase.from('orders').insert({
      merchant_id: merchant.id,
      order_no: order_id,
      product_name: product_name || 'Digital Purchase',
      customer_name,
      customer_email,
      customer_number: customer_phone,
      amount: parseFloat(amount),
      currency: currency || 'BDT',
      status: 'pending',
      redirect_url: redirect_url,
      source: 'api'
    });

    if (orderError) throw orderError;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.json({
      success: true,
      payment_url: `${baseUrl}/pay/${order_id}`,
      order_id
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}