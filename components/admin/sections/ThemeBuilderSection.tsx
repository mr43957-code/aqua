// components/admin/sections/ThemeBuilderSection.tsx — محتوى قسم "الثيمات"
import { createClient } from '@/lib/supabase/server';
import ThemeBuilderClient from '@/app/admin/theme-builder/ThemeBuilderClient';

export default async function ThemeBuilderSection() {
  const supabase = createClient();
  const { data: themes } = await supabase
    .from('theme_settings')
    .select('*')
    .order('created_at', { ascending: false });

  return <ThemeBuilderClient themes={themes ?? []} />;
}
