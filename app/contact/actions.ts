// app/contact/actions.ts
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { createNotification, logActivity } from '@/lib/utils/logger';

export type ContactResult = { success?: boolean; error?: string };

export async function submitContactAction(_prev: ContactResult, formData: FormData): Promise<ContactResult> {
  const name = String(formData.get('name') || '');
  const email = String(formData.get('email') || '');
  const phone = String(formData.get('phone') || '');
  const message = String(formData.get('message') || '');

  if (!name || !email || !message) {
    return { error: 'يرجى تعبئة جميع الحقول المطلوبة' };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from('contacts').insert({ name, email, phone, message, status: 'unread' });
    if (error) throw error;

    await createNotification({ type: 'contact', title: `رسالة تواصل جديدة من ${name}`, link: '/admin/contacts' });
    await logActivity({ action: 'استلام رسالة تواصل جديدة', entityType: 'contacts', entityLabel: name, severity: 'info' });

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'نموذج التواصل <contact@yourdomain.com>',
          to: process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@yourdomain.com',
          subject: `رسالة تواصل جديدة من ${name}`,
          html: `<p><strong>الاسم:</strong> ${name}</p><p><strong>البريد:</strong> ${email}</p><p><strong>الهاتف:</strong> ${phone}</p><p><strong>الرسالة:</strong> ${message}</p>`,
        });
      } catch (e) { console.error('Resend contact email error:', e); }
    }

    return { success: true };
  } catch (err) {
    console.error('[CONTACT]', err);
    return { error: 'حدث خطأ، حاول مجدداً' };
  }
}
