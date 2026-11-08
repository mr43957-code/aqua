// components/admin/sections/FooterSection.tsx — محتوى قسم "الفوتر"
import { createClient } from '@/lib/supabase/server';
import FooterManagerClient from '@/app/admin/footer/FooterManagerClient';

export default async function FooterSection() {
  const supabase = createClient();
  const { data: columns } = await supabase
    .from('footer_columns')
    .select('*, footer_links(*)')
    .order('display_order');

  return <FooterManagerClient columns={columns ?? []} />;
}
