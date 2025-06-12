"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function AuthRedirector() {
  const { isLoggedIn, isAuthReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthReady) return;

    const publicPaths = ['/', '/login', '/login/signup'];
    const isPublicPath = publicPaths.includes(pathname);
    const isDashboardPath = pathname.startsWith('/dashboard');

    if (isLoggedIn && (isPublicPath || pathname === '/')) {
      router.replace('/dashboard/agent');
    } else if (!isLoggedIn && isDashboardPath) {
      router.replace('/login');
    }
  }, [isLoggedIn, isAuthReady, pathname, router]);

  return null;
}