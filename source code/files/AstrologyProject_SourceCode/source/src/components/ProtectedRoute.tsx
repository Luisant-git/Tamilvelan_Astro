'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({
  children,
  adminOnly = false
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { isLoggedIn, user, initializing } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (initializing) return;
    if (!isLoggedIn) {
      router.replace(adminOnly ? '/admin/login' : '/login');
      return;
    }
    if (adminOnly && !user?.isAdmin) {
      router.replace('/admin/login');
      return;
    }
    setChecked(true);
  }, [initializing, isLoggedIn, user, adminOnly, router]);

  if (!checked) return null;
  return <>{children}</>;
}
