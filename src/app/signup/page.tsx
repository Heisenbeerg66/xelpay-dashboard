import SignUpClient from './SignUpClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | XelPay Automated Payment Gateway',
  description: 'Join XelPay to automate your bKash, Nagad, and Rocket payments instantly. Start your free trial today and scale your business in Bangladesh.',
  keywords: ['Create XelPay Account', 'Register Payment Gateway', 'Automated bKash Account', 'Nagad API Integration', 'Payment Gateway Bangladesh Signup'],
  openGraph: {
    title: 'Create Your XelPay Merchant Account',
    description: 'Start automating your bKash, Nagad, and Rocket payments with XelPay. Join thousands of smart merchants today.',
    url: 'https://www.xelpay.site/signup',
    siteName: 'XelPay',
    type: 'website',
  }
};

export default function SignUp() {
  return <SignUpClient />;
}