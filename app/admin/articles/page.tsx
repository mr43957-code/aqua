// app/admin/articles/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import ArticlesManagerClient from './ArticlesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminArticlesPage() {
  const supabase = createClient();
  const [{ data: articles }, { data: categories }] = await Promise.all([
    supabase.from('articles').select('*').order('created_at', { ascending: false }),
    supabase.from('article_categories').select('*'),
  ]);

  return (
    <>
      <TopBar title="إدارة المدونة" />
      <div className="p-6">
        <ArticlesManagerClient articles={articles ?? []} categories={categories ?? []} />
      </div>
    </>
  );
}
