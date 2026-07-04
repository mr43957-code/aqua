// app/admin/partners/PartnersManagerClient.tsx
'use client';

import { useState, useTransition } from 'react';
import { createPartnerAction, updatePartnerAction, deletePartnerAction } from './actions';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { FormField, Input } from '@/components/ui/Input';
import ImageUpload from '@/components/admin/ImageUpload';
import { Plus, Edit, Trash2, Globe, GripVertical } from 'lucide-react';
import Image from 'next/image';
import { clsx } from 'clsx';

type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export default function PartnersManagerClient({ partners }: { partners: Partner[] }) {
  const [formOpen, setFormOpen] = useState<Partner | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await deletePartnerAction(deleteTarget.id);
        toast.success('تم حذف الشريك');
        setDeleteTarget(null);
      } catch { toast.error('فشل الحذف'); }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">
          اللوجوهات تظهر في قسم &quot;شركاؤنا وموردونا&quot; في الصفحة الرئيسية بتأثير حركة تلقائية.
        </p>
        <Button onClick={() => setFormOpen('new')}>
          <Plus className="w-4 h-4" /> إضافة شريك
        </Button>
      </div>

      {/* Grid عرض الشركاء */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {partners.map((p) => (
          <div
            key={p.id}
            className={clsx(
              'bg-white rounded-xl border p-4 flex flex-col items-center gap-3',
              !p.is_active && 'opacity-50'
            )}
          >
            <div className="relative w-full h-16 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
              {p.logo_url ? (
                <Image
                  src={p.logo_url}
                  alt={p.name}
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
              ) : (
                <Globe className="w-8 h-8 text-gray-300" />
              )}
            </div>
            <p className="text-xs font-medium text-gray-700 text-center truncate w-full">{p.name}</p>
            <div className="flex gap-1 w-full">
              <Button size="sm" variant="ghost" className="flex-1" onClick={() => setFormOpen(p)}>
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" variant="ghost" className="flex-1" onClick={() => setDeleteTarget(p)}>
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </Button>
            </div>
          </div>
        ))}

        {!partners.length && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>لا يوجد شركاء بعد. اضغط &quot;إضافة شريك&quot; للبدء.</p>
          </div>
        )}
      </div>

      {/* Modal الإضافة/التعديل */}
      {formOpen && (
        <PartnerFormModal
          partner={formOpen === 'new' ? null : formOpen}
          onClose={() => setFormOpen(null)}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={isPending}
        title="حذف الشريك"
        message="هل تريد حذف هذا الشريك/المورد؟"
      />
    </div>
  );
}

function PartnerFormModal({
  partner,
  onClose,
}: {
  partner: Partner | null;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [logo, setLogo] = useState(partner?.logo_url ?? '');

  const handleSubmit = (formData: FormData) => {
    formData.set('logo_url', logo);
    startTransition(async () => {
      try {
        if (partner) await updatePartnerAction(partner.id, formData);
        else await createPartnerAction(formData);
        toast.success('تم الحفظ بنجاح');
        onClose();
      } catch { toast.error('فشل الحفظ'); }
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={partner ? 'تعديل الشريك' : 'إضافة شريك جديد'} size="sm">
      <form action={handleSubmit} className="space-y-4">
        <FormField label="لوجو الشركة">
          <ImageUpload
            value={logo}
            onChange={setLogo}
            folder="partners"
            label="رفع اللوجو"
          />
        </FormField>
        <FormField label="اسم الشركة" required>
          <Input name="name" required defaultValue={partner?.name} placeholder="مثال: شركة ABC" />
        </FormField>
        <FormField label="رابط الموقع (اختياري)">
          <Input name="website_url" type="url" defaultValue={partner?.website_url ?? ''} placeholder="https://..." />
        </FormField>
        <FormField label="الترتيب">
          <Input name="sort_order" type="number" defaultValue={partner?.sort_order ?? 0} />
        </FormField>
        {partner && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={partner.is_active} />
            ظاهر في الموقع
          </label>
        )}
        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit" loading={isPending}>حفظ</Button>
        </div>
      </form>
    </Modal>
  );
}
