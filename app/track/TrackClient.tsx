// app/track/TrackClient.tsx — Client Component فقط
'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Package, Clock, CheckCircle, Truck, XCircle, AlertCircle } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode; step: number }> = {
  new:        { label: 'تم استلام الطلب', color: 'bg-blue-500',   icon: <Package className="w-5 h-5" />,     step: 1 },
  processing: { label: 'قيد المعالجة',    color: 'bg-yellow-500', icon: <Clock className="w-5 h-5" />,       step: 2 },
  shipped:    { label: 'تم الشحن',        color: 'bg-purple-500', icon: <Truck className="w-5 h-5" />,       step: 3 },
  completed:  { label: 'مكتمل',          color: 'bg-green-500',  icon: <CheckCircle className="w-5 h-5" />, step: 4 },
  cancelled:  { label: 'ملغي',           color: 'bg-red-500',    icon: <XCircle className="w-5 h-5" />,     step: 0 },
};
const STEPS = ['new', 'processing', 'shipped', 'completed'];

export default function TrackClient() {
  const [query, setQuery]   = useState('');
  const [order, setOrder]   = useState<any>(null);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(''); setOrder(null);
    const supabase = createClient();
    const { data } = await supabase.from('orders')
      .select('*, items:order_items(*)')
      .or(`order_number.eq.${query.trim()},customer_phone.eq.${query.trim()}`)
      .order('created_at', { ascending: false }).limit(1).single();
    setLoading(false);
    if (!data) setError('لم يُعثر على طلب. تأكد من رقم الطلب أو الهاتف.');
    else setOrder(data);
  };

  const status = order ? (STATUS_MAP[order.status] ?? STATUS_MAP.new) : null;

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">تتبع طلبك</h1>
        <p className="text-gray-500 mt-1 text-sm">أدخل رقم الطلب أو رقم هاتفك لمعرفة حالة طلبك</p>
      </div>

      <div className="flex gap-2 mb-8">
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="رقم الطلب (ORD-...) أو رقم الهاتف..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        <button onClick={search} disabled={loading}
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl transition disabled:opacity-60 flex items-center gap-2">
          {loading
            ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Search className="w-5 h-5" />}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {order && status && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className={`${status.color} text-white p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs mb-0.5">رقم الطلب</p>
                <p className="font-bold text-xl">{order.order_number}</p>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-sm font-semibold">
                {status.icon} {status.label}
              </div>
            </div>
          </div>

          {order.status !== 'cancelled' && (
            <div className="p-5 border-b">
              <div className="flex items-start justify-between relative">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100 z-0" />
                {STEPS.map((st, idx) => {
                  const info = STATUS_MAP[st];
                  const done   = status.step > idx + 1;
                  const active = status.step === idx + 1;
                  return (
                    <div key={st} className="flex flex-col items-center gap-1.5 z-10 flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 text-sm ${done ? 'bg-green-500 border-green-500 text-white' : active ? `${info.color} border-transparent text-white` : 'bg-white border-gray-200 text-gray-300'}`}>
                        {done ? <CheckCircle className="w-5 h-5" /> : info.icon}
                      </div>
                      <span className={`text-[10px] font-medium text-center leading-tight ${active ? 'text-primary-700' : done ? 'text-green-600' : 'text-gray-300'}`}>
                        {info.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs mb-1">العميل</p><p className="font-semibold">{order.customer_name}</p></div>
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs mb-1">التاريخ</p><p className="font-semibold">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p></div>
              <div className="bg-gray-50 rounded-xl p-3 col-span-2"><p className="text-gray-400 text-xs mb-1">عنوان التوصيل</p><p className="font-semibold">{order.customer_address}</p></div>
            </div>
            {order.items?.length > 0 && (
              <div className="border rounded-xl overflow-hidden">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between px-4 py-2.5 border-b last:border-0 text-sm">
                    <span className="text-gray-700">{item.product_name_snapshot} × {item.quantity}</span>
                    <span className="font-semibold">{item.subtotal} ج.م</span>
                  </div>
                ))}
                <div className="flex justify-between px-4 py-3 bg-primary-50 font-bold text-sm">
                  <span>الإجمالي</span>
                  <span className="text-primary-700">{order.total_amount} ج.م</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
