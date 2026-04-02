import LoginClient from './LoginClient';

export const metadata = {
  title: 'Login | XelPay',
  description: 'Sign in to your XelPay merchant account. Secure login with email/password or Google OAuth.',
};

export default function Login() {
  return <LoginClient />;
}