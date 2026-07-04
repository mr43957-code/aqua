// app/admin/theme-builder/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import ThemeBuilderClient from './ThemeBuilderClient';

export const dynamic = 'force-dynamic';

export default async function ThemeBuilderPage() {
  const supabase = createClient();
  const { data: themes } = await supabase.from('theme_settings').select('*').order('created_at', { ascending: false });

  return (
    <>
      <TopBar title="Theme Builder — إدارة الثيمات" />
      <div className="p-6">
        <ThemeBuilderClient themes={themes ?? []} />
      </div>
    </>
  );
}
