// app/admin/orders/RealtimeListener.tsx
'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function RealtimeListener() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        audioRef.current?.play().catch(() => {});
        toast.success(`طلب جديد من ${payload.new.customer_name}`);
        router.refresh();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  return <audio ref={audioRef} src="/notification.mp3" preload="auto" />;
}
