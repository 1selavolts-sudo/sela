'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// While a MoMo payment waits for the driver's approval, reload the page every few seconds to pick up MTN's answer.
export function PaymentStatusRefresher() {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(timer);
  }, [router]);

  return null;
}
