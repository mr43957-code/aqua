// app/admin/testimonials/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import TestimonialsManagerClient from './TestimonialsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminTestimonialsPage() {
  const supabase = createClient();
  const { data: testimonials } = await supabase.from('testimonials').select('*').order('sort_order');

  return (
    <>
      <TopBar title="آراء العملاء (Testimonials)" />
      <div className="p-6">
        <TestimonialsManagerClient testimonials={testimonials ?? []} />
      </div>
    </>
  );
}
