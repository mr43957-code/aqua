// app/quote/actions.ts
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { createNotification, logActivity } from '@/lib/utils/logger';

export type QuoteResult = { success?: boolean; error?: string };

export async function submitQuoteAction(_prev: QuoteResult, formData: FormData): Promise<QuoteResult> {
  const name = String(formData.get('name') || '');
  const phone = String(formData.get('phone') || '');
  const email = String(formData.get('email') || '');
  const serviceId = String(formData.get('service_id') || '') || null;
  const details = String(formData.get('details') || '');

  if (!name || !phone) return { error: 'يرجى إدخال الاسم ورقم الهاتف' };

  try {
    const admin = createAdminClient();
    const { error } = await admin.from('quotes').insert({ name, phone, email: email || null, service_id: serviceId, details, status: 'pending' });
    if (error) throw error;

    await createNotification({ type: 'quote', title: `طلب عرض سعر جديد من ${name}`, link: '/admin/quotes' });
    await logActivity({ action: 'استلام طلب عرض سعر جديد', entityType: 'quotes', entityLabel: name, severity: 'info' });

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'طلبات عروض السعر <quotes@yourdomain.com>',
          to: process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@yourdomain.com',
          subject: `طلب عرض سعر جديد من ${name}`,
          html: `<p><strong>الاسم:</strong> ${name}</p><p><strong>الهاتف:</strong> ${phone}</p><p><strong>التفاصيل:</strong> ${details || '-'}</p>`,
        });
      } catch (e) { console.error('Resend quote email error:', e); }
    }

    return { success: true };
  } catch (err) {
    console.error('[QUOTE]', err);
    return { error: 'حدث خطأ، حاول مجدداً' };
  }
}
