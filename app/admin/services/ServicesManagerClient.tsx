// app/admin/services/ServicesManagerClient.tsx
'use client';

import { useState, useTransition } from 'react';
import { createServiceAction, updateServiceAction, deleteServiceAction } from './actions';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { FormField, Input, Textarea } from '@/components/ui/Input';
import ImageUpload from '@/components/admin/ImageUpload';
import DataTable, { type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import type { Service } from '@/types';

export default function ServicesManagerClient({ services }: { services: Service[] }) {
  const [formOpen, setFormOpen] = useState<Service | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await deleteServiceAction(deleteTarget.id);
        toast.success('تم حذف الخدمة');
        setDeleteTarget(null);
      } catch { toast.error('فشل الحذف'); }
    });
  };

  const columns: Column<Service>[] = [
    {
      key: 'title', label: 'الخدمة',
      render: (s) => (
        <div className="flex items-center gap-2">
          {s.is_featured && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
          <span className="font-medium">{s.title}</span>
        </div>
      ),
    },
    { key: 'status', label: 'الحالة', render: (s) => <StatusBadge status={s.is_published ? 'completed' : 'pending'} /> },
    { key: 'views', label: 'المشاهدات', render: (s) => s.views_count },
    {
      key: 'actions', label: 'إجراءات',
      render: (s) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setFormOpen(s)}><Edit className="w-4 h-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(s)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setFormOpen('new')}><Plus className="w-4 h-4" /> إضافة خدمة</Button>
      </div>

      <DataTable data={services} columns={columns} searchFields={['title']} emptyMessage="لا توجد خدمات مضافة بعد" />

      {formOpen && (
        <ServiceFormModal service={formOpen === 'new' ? null : formOpen} onClose={() => setFormOpen(null)} />
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={isPending} title="حذف الخدمة" />
    </div>
  );
}

function ServiceFormModal({ service, onClose }: { service: Service | null; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [coverImage, setCoverImage] = useState(service?.cover_image_url ?? '');

  const handleSubmit = (formData: FormData) => {
    formData.set('cover_image_url', coverImage);
    startTransition(async () => {
      try {
        if (service) await updateServiceAction(service.id, formData);
        else await createServiceAction(formData);
        toast.success('تم الحفظ بنجاح وتطبيقه على الموقع فوراً');
        onClose();
      } catch (err) { toast.error(err instanceof Error ? err.message : 'فشل الحفظ'); }
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={service ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'} size="lg">
      <form action={handleSubmit} className="space-y-4">
        <FormField label="صورة الغلاف"><ImageUpload value={coverImage} onChange={setCoverImage} folder="services" /></FormField>
        <FormField label="عنوان الخدمة" required><Input name="title" required defaultValue={service?.title} /></FormField>
        <FormField label="وصف مختصر"><Textarea name="description" defaultValue={service?.description ?? ''} rows={2} /></FormField>
        <FormField label="المحتوى التفصيلي"><Textarea name="content" defaultValue={service?.content ?? ''} rows={5} /></FormField>

        <div className="border-t pt-4 space-y-4">
          <p className="text-sm font-semibold text-gray-700">إعدادات SEO</p>
          <FormField label="عنوان SEO"><Input name="meta_title" defaultValue={service?.meta_title ?? ''} /></FormField>
          <FormField label="وصف SEO"><Textarea name="meta_description" defaultValue={service?.meta_description ?? ''} rows={2} /></FormField>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_published" defaultChecked={service?.is_published ?? true} /> منشورة</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_featured" defaultChecked={service?.is_featured} /> مميزة</label>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit" loading={isPending}>حفظ</Button>
        </div>
      </form>
    </Modal>
  );
}
