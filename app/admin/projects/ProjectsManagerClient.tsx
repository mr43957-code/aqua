// app/admin/projects/ProjectsManagerClient.tsx
'use client';

import { useState, useTransition } from 'react';
import { createProjectAction, updateProjectAction, deleteProjectAction } from './actions';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { FormField, Input, Select, Textarea } from '@/components/ui/Input';
import ImageUpload from '@/components/admin/ImageUpload';
import DataTable, { type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import type { Project } from '@/types';

export default function ProjectsManagerClient({
  projects, services,
}: { projects: Project[]; services: { id: string; title: string }[] }) {
  const [formOpen, setFormOpen] = useState<Project | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      try { await deleteProjectAction(deleteTarget.id); toast.success('تم الحذف'); setDeleteTarget(null); }
      catch { toast.error('فشل الحذف'); }
    });
  };

  const columns: Column<Project>[] = [
    {
      key: 'title', label: 'المشروع',
      render: (p) => (
        <div className="flex items-center gap-2">
          {p.is_featured && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
          <span className="font-medium">{p.title}</span>
        </div>
      ),
    },
    { key: 'client', label: 'العميل', render: (p) => p.client_name ?? '—' },
    { key: 'location', label: 'الموقع', render: (p) => p.location ?? '—' },
    { key: 'status', label: 'الحالة', render: (p) => <StatusBadge status={p.status} /> },
    {
      key: 'actions', label: '',
      render: (p) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setFormOpen(p)}><Edit className="w-4 h-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(p)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setFormOpen('new')}><Plus className="w-4 h-4" /> مشروع جديد</Button>
      </div>

      <DataTable data={projects} columns={columns} searchFields={['title', 'client_name', 'location']} emptyMessage="لا توجد مشاريع بعد" />

      {formOpen && (
        <ProjectFormModal project={formOpen === 'new' ? null : formOpen} services={services} onClose={() => setFormOpen(null)} />
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={isPending} title="حذف المشروع" />
    </div>
  );
}

function ProjectFormModal({
  project, services, onClose,
}: { project: Project | null; services: { id: string; title: string }[]; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [cover, setCover] = useState(project?.cover_image_url ?? '');
  const [before, setBefore] = useState(project?.before_image_url ?? '');
  const [after, setAfter] = useState(project?.after_image_url ?? '');

  const handleSubmit = (formData: FormData) => {
    formData.set('cover_image_url', cover);
    formData.set('before_image_url', before);
    formData.set('after_image_url', after);
    startTransition(async () => {
      try {
        if (project) await updateProjectAction(project.id, formData);
        else await createProjectAction(formData);
        toast.success('تم الحفظ بنجاح وتطبيقه فوراً');
        onClose();
      } catch (err) { toast.error(err instanceof Error ? err.message : 'فشل الحفظ'); }
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={project ? 'تعديل المشروع' : 'مشروع جديد'} size="xl">
      <form action={handleSubmit} className="space-y-4">
        <FormField label="صورة الغلاف"><ImageUpload value={cover} onChange={setCover} folder="projects" /></FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="صورة قبل (Before)"><ImageUpload value={before} onChange={setBefore} folder="projects" /></FormField>
          <FormField label="صورة بعد (After)"><ImageUpload value={after} onChange={setAfter} folder="projects" /></FormField>
        </div>

        <FormField label="عنوان المشروع" required><Input name="title" required defaultValue={project?.title} /></FormField>
        <FormField label="الوصف"><Textarea name="description" defaultValue={project?.description ?? ''} rows={2} /></FormField>
        <FormField label="التفاصيل الكاملة"><Textarea name="content" defaultValue={project?.content ?? ''} rows={4} /></FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="اسم العميل"><Input name="client_name" defaultValue={project?.client_name ?? ''} /></FormField>
          <FormField label="الموقع / المنطقة"><Input name="location" defaultValue={project?.location ?? ''} /></FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="تاريخ البدء"><Input name="start_date" type="date" defaultValue={project?.start_date ?? ''} /></FormField>
          <FormField label="تاريخ الإنجاز"><Input name="completion_date" type="date" defaultValue={project?.completion_date ?? ''} /></FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="حالة المشروع">
            <Select name="status" defaultValue={project?.status ?? 'completed'}>
              <option value="planning">تخطيط</option>
              <option value="in_progress">جارٍ التنفيذ</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </Select>
          </FormField>
          <FormField label="الخدمة المرتبطة">
            <Select name="service_id" defaultValue={project?.service_id ?? ''}>
              <option value="">بدون</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </Select>
          </FormField>
        </div>

        <FormField label="رابط فيديو (اختياري)"><Input name="video_url" defaultValue={project?.video_url ?? ''} /></FormField>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_published" defaultChecked={project?.is_published ?? true} /> منشور</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_featured" defaultChecked={project?.is_featured} /> مميز</label>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit" loading={isPending}>حفظ</Button>
        </div>
      </form>
    </Modal>
  );
}
