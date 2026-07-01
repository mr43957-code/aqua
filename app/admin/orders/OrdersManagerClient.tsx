// app/admin/orders/OrdersManagerClient.tsx
'use client';

import { useState, useTransition } from 'react';
import { updateOrderStatusAction, updateOrderNotesAction } from './actions';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import DataTable, { type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/helpers';
import { Eye } from 'lucide-react';
import type { Order } from '@/types';

const statuses = ['new', 'processing', 'shipped', 'completed', 'cancelled'];
const statusLabels: Record<string, string> = { new: 'جديد', processing: 'قيد المعالجة', shipped: 'تم الشحن', completed: 'مكتمل', cancelled: 'ملغي' };

export default function OrdersManagerClient({ orders }: { orders: Order[] }) {
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [isPending, startTransition] = useTransition();

  const columns: Column<Order>[] = [
    { key: 'order_number', label: 'رقم الطلب' },
    { key: 'customer_name', label: 'العميل' },
    { key: 'customer_phone', label: 'الهاتف' },
    { key: 'total', label: 'الإجمالي', render: (o) => `${o.total_amount} ج.م` },
    {
      key: 'status', label: 'الحالة',
      render: (o) => (
        <select
          defaultValue={o.status}
          onChange={(e) => startTransition(async () => {
            try { await updateOrderStatusAction(o.id, e.target.value); toast.success('تم تحديث الحالة'); }
            catch { toast.error('فشل التحديث'); }
          })}
          className="border rounded-lg px-2 py-1 text-xs"
        >
          {statuses.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
        </select>
      ),
    },
    { key: 'date', label: 'التاريخ', render: (o) => formatDate(o.created_at) },
    {
      key: 'actions', label: '',
      render: (o) => <Button size="sm" variant="ghost" onClick={() => setViewOrder(o)}><Eye className="w-4 h-4" /></Button>,
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable data={orders} columns={columns} searchFields={['customer_name', 'customer_phone', 'order_number']} emptyMessage="لا توجد طلبات بعد" />

      {viewOrder && (
        <Modal isOpen onClose={() => setViewOrder(null)} title={`تفاصيل الطلب ${viewOrder.order_number}`} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <p><strong>العميل:</strong> {viewOrder.customer_name}</p>
              <p><strong>الهاتف:</strong> {viewOrder.customer_phone}</p>
              <p className="col-span-2"><strong>العنوان:</strong> {viewOrder.customer_address}</p>
              {viewOrder.notes && <p className="col-span-2"><strong>ملاحظات العميل:</strong> {viewOrder.notes}</p>}
            </div>

            <div className="border rounded-xl divide-y">
              {viewOrder.items?.map((item) => (
                <div key={item.id} className="flex justify-between px-4 py-2 text-sm">
                  <span>{item.product_name_snapshot} × {item.quantity}</span>
                  <span>{item.subtotal} ج.م</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-2 font-bold text-sm bg-gray-50">
                <span>الإجمالي</span>
                <span>{viewOrder.total_amount} ج.م</span>
              </div>
            </div>

            <StatusBadge status={viewOrder.status} />

            <form
              action={(fd) => startTransition(async () => {
                try { await updateOrderNotesAction(viewOrder.id, fd); toast.success('تم حفظ الملاحظات'); }
                catch { toast.error('فشل الحفظ'); }
              })}
              className="space-y-2"
            >
              <Textarea name="admin_notes" defaultValue={viewOrder.admin_notes ?? ''} placeholder="ملاحظات داخلية للإدارة" rows={2} />
              <Button type="submit" size="sm" loading={isPending}>حفظ الملاحظات</Button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
