// app/admin/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/admin/TopBar';
import { StatCard } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/helpers';
import Link from 'next/link';
import {
  Wrench, Package, FolderOpen, FileText, ShoppingCart, MessageSquare,
  FileQuestion, Eye, TrendingUp, Activity, ArrowLeft
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [
    { count: servicesCount },
    { count: productsCount },
    { count: projectsCount },
    { count: articlesCount },
    { count: ordersCount },
    { count: newOrdersCount },
    { count: contactsCount },
    { count: unreadContactsCount },
    { count: quotesCount },
    { data: recentOrders },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from('services').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'unread'),
    supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(8),
  ]);

  const { data: viewsAgg } = await supabase
    .from('products')
    .select('views_count');
  const { data: serviceViews } = await supabase.from('services').select('views_count');
  const { data: articleViews } = await supabase.from('articles').select('views_count');
  const { data: projectViews } = await supabase.from('projects').select('views_count');

  const totalViews =
    (viewsAgg ?? []).reduce((s, r) => s + (r.views_count ?? 0), 0) +
    (serviceViews ?? []).reduce((s, r) => s + (r.views_count ?? 0), 0) +
    (articleViews ?? []).reduce((s, r) => s + (r.views_count ?? 0), 0) +
    (projectViews ?? []).reduce((s, r) => s + (r.views_count ?? 0), 0);

  return (
    <>
      <TopBar title="لوحة التحكم" />
      <div className="p-6 space-y-6">
        {!!newOrdersCount && newOrdersCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center justify-between">
            <span>🔔 لديك <strong>{newOrdersCount}</strong> طلب جديد بحاجة للمراجعة.</span>
            <Link href="/admin/orders" className="text-sm font-semibold underline flex items-center gap-1">
              عرض الطلبات <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="الخدمات" value={servicesCount ?? 0} icon={Wrench} color="blue" href="/admin/services" />
          <StatCard label="المنتجات" value={productsCount ?? 0} icon={Package} color="green" href="/admin/products" />
          <StatCard label="المشاريع" value={projectsCount ?? 0} icon={FolderOpen} color="purple" href="/admin/projects" />
          <StatCard label="المقالات" value={articlesCount ?? 0} icon={FileText} color="yellow" href="/admin/articles" />
          <StatCard label="إجمالي الطلبات" value={ordersCount ?? 0} icon={ShoppingCart} color="blue" href="/admin/orders" />
          <StatCard label="رسائل التواصل" value={contactsCount ?? 0} icon={MessageSquare} color="red" href="/admin/contacts" />
          <StatCard label="طلبات عروض السعر" value={quotesCount ?? 0} icon={FileQuestion} color="purple" href="/admin/quotes" />
          <StatCard label="مشاهدات المحتوى" value={totalViews} icon={Eye} color="green" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary-600" /> أحدث الطلبات
              </h3>
              <Link href="/admin/orders" className="text-xs text-primary-600 hover:underline">عرض الكل</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentOrders?.length ? recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href="/admin/orders"
                  className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{o.customer_name}</p>
                    <p className="text-xs text-gray-400">{o.order_number} — {formatDate(o.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">{o.total_amount} ج.م</span>
                    <StatusBadge status={o.status} />
                  </div>
                </Link>
              )) : (
                <p className="text-center text-gray-400 py-10 text-sm">لا توجد طلبات بعد</p>
              )}
            </div>
          </div>

          {/* Activity feed */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary-600" /> آخر النشاطات
              </h3>
              <Link href="/admin/logs" className="text-xs text-primary-600 hover:underline">السجل الكامل</Link>
            </div>
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {recentActivity?.length ? recentActivity.map((log) => (
                <div key={log.id} className="px-6 py-3">
                  <p className="text-sm text-gray-700">{log.action}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {log.user_name ?? 'النظام'} — {formatDate(log.created_at)}
                  </p>
                </div>
              )) : (
                <p className="text-center text-gray-400 py-10 text-sm">لا يوجد نشاط مسجل بعد</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
