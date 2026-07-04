// app/admin/layout.tsx
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/admin/Sidebar';
import { Toaster } from 'sonner';

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Login page renders without the dashboard chrome (handled by its own layout check)
  let siteSettings: { site_name?: string | null; site_logo_url?: string | null } = {};
  if (user) {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['site_name', 'site_logo_url']);
    siteSettings = (data ?? []).reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
  }

  if (!user) {
    // Not logged in: only the login page should render (middleware also protects this)
    return (
      <div dir="rtl">
        {children}
        <Toaster richColors position="top-center" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen flex bg-gray-50">
      <Sidebar siteSettings={siteSettings} />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
      <Toaster richColors position="top-center" />
    </div>
  );
}
