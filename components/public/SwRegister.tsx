// components/public/SwRegister.tsx
'use client';

import { useEffect } from 'react';

export default function SwRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (location.protocol !== 'https:' && !isLocal) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);
  return null;
}