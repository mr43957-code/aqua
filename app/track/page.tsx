// app/track/page.tsx — Server Component
import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import TrackClient from './TrackClient';

export const metadata: Metadata = { alternates: { canonical: '/track' }, title: 'تتبع طلبي' };

export default function TrackOrderPage() {
  return (
    <PublicLayout>
      <Breadcrumbs crumbs={[{ label: 'تتبع طلبي' }]} />
      <main dir="rtl" className="flex-1">
        <TrackClient />
      </main>
    </PublicLayout>
  );
}
