// app/checkout/page.tsx
import type { Metadata } from 'next';
import PublicLayout from '@/components/public/PublicLayout';
import Breadcrumbs from '@/components/public/Breadcrumbs';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = { title: 'إتمام الطلب' };

export default function CheckoutPage() {
  return (
    <PublicLayout>
      <Breadcrumbs crumbs={[{ label: 'إتمام الطلب' }]} />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">إتمام الطلب</h1>
        <CheckoutClient />
      </div>
    </PublicLayout>
  );
}
