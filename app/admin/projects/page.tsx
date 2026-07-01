// app/admin/projects/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import ProjectsManagerClient from './ProjectsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage() {
  const supabase = createClient();
  const [{ data: projects }, { data: services }] = await Promise.all([
    supabase.from('projects').select('*').order('created_at', { ascending: false }),
    supabase.from('services').select('id, title'),
  ]);

  return (
    <>
      <TopBar title="إدارة المشاريع (Portfolio)" />
      <div className="p-6">
        <ProjectsManagerClient projects={projects ?? []} services={services ?? []} />
      </div>
    </>
  );
}
