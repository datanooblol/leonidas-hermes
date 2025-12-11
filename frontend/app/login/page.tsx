'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LoginTemplate } from '../src/components/templates';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    // ในอนาคตใส่ Logic ตรวจสอบ Token ตรงนี้
    document.cookie = "auth=true; path=/";
    router.push('/dashboard');
  };

  return <LoginTemplate onLogin={handleLogin} />;
}