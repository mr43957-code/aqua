// app/admin/testimonials/TestimonialsManagerClient.tsx
'use client';

import { useState, useTransition } from 'react';
import { createTestimonialAction, updateTestimonialAction, deleteTestimonialAction } from './actions';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { FormField, Input, Textarea } from '@/components/ui/Input';
import ImageUpload from '@/components/admin/ImageUpload';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import type { Testimonial } from '@/types';

export default function TestimonialsManagerClient({ testimonials }: { testimonials: Testimonial[] }) {
  const [formOpen, setFormOpen] = useState<Testimonial | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      try { await deleteTestimonialAction(deleteTarget.id); toast.success('تم الحذف'); setDeleteTarget(null); }
      catch { toast.error('فشل الحذف'); }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setFormOpen('new')}><Plus className="w-4 h-4" /> رأي عميل جديد</Button></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <p className="text-sm text-gray-600 line-clamp-3">{t.content}</p>
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <p className="text-sm font-medium">{t.client_name}</p>
                <p className="text-xs text-gray-400">{t.client_title}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setFormOpen(t)}><Edit className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(t)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
              </div>
            </div>
          </div>
        ))}
        {!testimonials.length && <p className="text-gray-400 text-center col-span-full py-10">لا توجد آراء عملاء بعد</p>}
      </div>

      {formOpen && <TestimonialFormModal testimonial={formOpen === 'new' ? null : formOpen} onClose={() => setFormOpen(null)} />}
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={isPending} title="حذف رأي العميل" />
    </div>
  );
}

function TestimonialFormModal({ testimonial, onClose }: { testimonial: Testimonial | null; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [image, setImage] = useState(testimonial?.client_image_url ?? '');

  const handleSubmit = (formData: FormData) => {
    formData.set('client_image_url', image);
    startTransition(async () => {
      try {
        if (testimonial) await updateTestimonialAction(testimonial.id, formData);
        else await createTestimonialAction(formData);
        toast.success('تم الحفظ');
        onClose();
      } catch { toast.error('فشل الحفظ'); }
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={testimonial ? 'تعديل الرأي' : 'رأي عميل جديد'}>
      <form action={handleSubmit} className="space-y-4">
        <FormField label="صورة العميل"><ImageUpload value={image} onChange={setImage} folder="testimonials" /></FormField>
        <FormField label="اسم العميل" required><Input name="client_name" required defaultValue={testimonial?.client_name} /></FormField>
        <FormField label="المسمى الوظيفي / الشركة"><Input name="client_title" defaultValue={testimonial?.client_title ?? ''} /></FormField>
        <FormField label="النص" required><Textarea name="content" required defaultValue={testimonial?.content} rows={3} /></FormField>
        <FormField label="التقييم (1-5)"><Input name="rating" type="number" min={1} max={5} defaultValue={testimonial?.rating ?? 5} /></FormField>
        {testimonial && (
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_published" defaultChecked={testimonial.is_published} /> منشور</label>
        )}
        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit" loading={isPending}>حفظ</Button>
        </div>
      </form>
    </Modal>
  );
}
