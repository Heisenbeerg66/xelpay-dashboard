import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  console.log("---- RESEND TEST STARTED ----");
  console.log("API Key Status:", process.env.RESEND_API_KEY ? "Found" : "MISSING!");

  try {
    const { data, error } = await resend.emails.send({
      from: 'Test <onboarding@xelpay.site>', // Resend-এর ডিফল্ট টেস্টিং ইমেইল
      to: ['jhsbuj@gmail.com'], // ⚠️ এখানে আপনার নিজের ব্যক্তিগত জিমেইলটি দিন (যেটা দিয়ে Resend অ্যাকাউন্ট খুলেছেন)
      subject: 'Resend SDK Test',
      html: '<strong>Resend API is working perfectly!</strong>',
    });

    if (error) {
      console.error("---- RESEND ERROR ----", error);
      return NextResponse.json({ success: false, error: error });
    }

    console.log("---- RESEND SUCCESS ----", data);
    return NextResponse.json({ success: true, data: data });

  } catch (error: any) {
    console.error("---- CRITICAL ERROR ----", error);
    return NextResponse.json({ success: false, catch_error: error.message });
  }
}