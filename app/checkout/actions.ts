// app/checkout/actions.ts
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { createNotification, logActivity } from '@/lib/utils/logger';

type CartItemInput = { productId: string; name: string; price: number; quantity: number };
export type CheckoutResult = { success: boolean; error?: string; orderId?: string };

export async function submitOrderAction(
  customer: { name: string; phone: string; address: string; notes?: string },
  items: CartItemInput[]
): Promise<CheckoutResult> {
  if (!items.length) return { success: false, error: 'السلة فارغة' };
  if (!customer.name || !customer.phone || !customer.address) return { success: false, error: 'يرجى تعبئة جميع الحقول المطلوبة' };

  try {
    const admin = createAdminClient();
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const { data: order, error: orderError } = await admin.from('orders').insert({
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_address: customer.address,
      notes: customer.notes || null,
      status: 'new',
      total_amount: totalAmount,
    }).select().single();

    if (orderError || !order) return { success: false, error: 'حدث خطأ أثناء حفظ الطلب، حاول مجدداً' };

    const orderItemsPayload = items.map((i) => ({
      order_id: order.id,
      product_id: i.productId,
      product_name_snapshot: i.name,
      unit_price: i.price,
      quantity: i.quantity,
      subtotal: i.price * i.quantity,
    }));

    const { error: itemsError } = await admin.from('order_items').insert(orderItemsPayload);
    if (itemsError) return { success: false, error: 'حدث خطأ أثناء حفظ عناصر الطلب' };

    // Realtime: insertion into `orders` is picked up automatically by the admin dashboard's
    // RealtimeListener subscription, which plays a sound and refreshes the list immediately.
    await createNotification({ type: 'order', title: `طلب جديد من ${customer.name}`, message: `${totalAmount} ج.م`, link: '/admin/orders' });
    await logActivity({ action: 'طلب جديد من المتجر', entityType: 'orders', entityId: order.id, entityLabel: customer.name, severity: 'info' });

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const itemsHtml = items.map((i) => `<li>${i.name} × ${i.quantity} — ${i.price * i.quantity} جنيه</li>`).join('');
        await resend.emails.send({
          from: 'طلبات الموقع <orders@yourdomain.com>',
          to: process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@yourdomain.com',
          subject: `طلب جديد من ${customer.name}`,
          html: `<h2>طلب جديد رقم ${order.order_number}</h2><p><strong>الاسم:</strong> ${customer.name}</p><p><strong>الهاتف:</strong> ${customer.phone}</p><p><strong>العنوان:</strong> ${customer.address}</p><ul>${itemsHtml}</ul><p><strong>الإجمالي:</strong> ${totalAmount} جنيه</p>`,
        });
      } catch (e) { console.error('Resend order email error:', e); }
    }

    return { success: true, orderId: order.id };
  } catch (err) {
    console.error('[CHECKOUT]', err);
    return { success: false, error: 'حدث خطأ غير متوقع، حاول مجدداً' };
  }
}
