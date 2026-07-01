// app/admin/theme-builder/ThemeBuilderClient.tsx
'use client';

import { useState, useTransition } from 'react';
import { createThemeAction, updateThemeAction, activateThemeAction, deleteThemeAction } from './actions';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import { FormField, Input, Select } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Plus, Check, Trash2, Palette } from 'lucide-react';
import { clsx } from 'clsx';
import type { ThemeSetting } from '@/types';

export default function ThemeBuilderClient({ themes }: { themes: ThemeSetting[] }) {
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTheme, setEditTheme] = useState<ThemeSetting | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleActivate = (id: string) => {
    startTransition(async () => {
      try {
        await activateThemeAction(id);
        toast.success('تم تفعيل الثيم — سينعكس فوراً على الموقع');
      } catch (err) {
        toast.error('فشل تفعيل الثيم');
      }
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      try {
        await deleteThemeAction(deleteId);
        toast.success('تم حذف الثيم');
        setDeleteId(null);
      } catch {
        toast.error('فشل الحذف');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-500 text-sm">قم بإنشاء أكثر من قالب ألوان وتفعيل أحدها ليظهر فوراً على الموقع.</p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> ثيم جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={clsx(
              'bg-white rounded-2xl border-2 p-5 space-y-4',
              theme.is_active ? 'border-primary-500 shadow-md' : 'border-gray-100'
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{theme.name}</h3>
              {theme.is_active && (
                <span className="flex items-center gap-1 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                  <Check className="w-3 h-3" /> مُفعّل
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {[theme.primary_color, theme.secondary_color, theme.accent_color, theme.background_color].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-lg border border-gray-200" style={{ backgroundColor: c }} />
              ))}
            </div>

            <p className="text-xs text-gray-400">الخط: {theme.font_family} — الوضع: {theme.mode === 'light' ? 'فاتح' : theme.mode === 'dark' ? 'داكن' : 'تلقائي'}</p>

            <div className="flex gap-2">
              {!theme.is_active && (
                <Button size="sm" variant="primary" onClick={() => handleActivate(theme.id)} loading={isPending}>
                  تفعيل
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setEditTheme(theme)}>تعديل</Button>
              {!theme.is_active && (
                <Button size="sm" variant="ghost" onClick={() => setDeleteId(theme.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ThemeFormModal isOpen={createOpen} onClose={() => setCreateOpen(false)} mode="create" />
      <ThemeFormModal isOpen={!!editTheme} onClose={() => setEditTheme(null)} mode="edit" theme={editTheme} />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={isPending}
        title="حذف الثيم"
        message="هل أنت متأكد من حذف هذا الثيم؟"
      />
    </div>
  );
}

function ThemeFormModal({
  isOpen, onClose, mode, theme,
}: { isOpen: boolean; onClose: () => void; mode: 'create' | 'edit'; theme?: ThemeSetting | null }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        if (mode === 'create') await createThemeAction(formData);
        else if (theme) await updateThemeAction(theme.id, formData);
        toast.success('تم الحفظ بنجاح');
        onClose();
      } catch {
        toast.error('حدث خطأ أثناء الحفظ');
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'create' ? 'إنشاء ثيم جديد' : 'تعديل الثيم'} size="lg">
      <form action={handleSubmit} className="space-y-4">
        <FormField label="اسم الثيم" required>
          <Input name="name" required defaultValue={theme?.name} />
        </FormField>

        <FormField label="الوضع">
          <Select name="mode" defaultValue={theme?.mode ?? 'light'}>
            <option value="light">فاتح (Light)</option>
            <option value="dark">داكن (Dark)</option>
            <option value="auto">تلقائي حسب الجهاز</option>
          </Select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="اللون الأساسي">
            <input type="color" name="primary_color" defaultValue={theme?.primary_color ?? '#0a8acc'} className="w-full h-10 rounded-lg border" />
          </FormField>
          <FormField label="اللون الثانوي">
            <input type="color" name="secondary_color" defaultValue={theme?.secondary_color ?? '#0f766e'} className="w-full h-10 rounded-lg border" />
          </FormField>
          <FormField label="لون التمييز (Accent)">
            <input type="color" name="accent_color" defaultValue={theme?.accent_color ?? '#f59e0b'} className="w-full h-10 rounded-lg border" />
          </FormField>
          <FormField label="لون الخلفية">
            <input type="color" name="background_color" defaultValue={theme?.background_color ?? '#f8fafc'} className="w-full h-10 rounded-lg border" />
          </FormField>
          <FormField label="لون النص">
            <input type="color" name="text_color" defaultValue={theme?.text_color ?? '#1e293b'} className="w-full h-10 rounded-lg border" />
          </FormField>
        </div>

        <FormField label="نوع الخط">
          <Select name="font_family" defaultValue={theme?.font_family ?? 'Cairo'}>
            <option value="Cairo">Cairo</option>
            <option value="Tajawal">Tajawal</option>
            <option value="Almarai">Almarai</option>
            <option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</option>
          </Select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="استدارة الحواف (Border Radius)">
            <Select name="border_radius" defaultValue={theme?.border_radius ?? '0.5rem'}>
              <option value="0">بدون استدارة</option>
              <option value="0.25rem">صغيرة</option>
              <option value="0.5rem">متوسطة</option>
              <option value="1rem">كبيرة</option>
              <option value="9999px">دائرية بالكامل</option>
            </Select>
          </FormField>
          <FormField label="مستوى الظلال (Shadow)">
            <Select name="shadow_level" defaultValue={theme?.shadow_level ?? 'md'}>
              <option value="none">بدون</option>
              <option value="sm">خفيف</option>
              <option value="md">متوسط</option>
              <option value="lg">قوي</option>
            </Select>
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit" loading={isPending}>
            <Palette className="w-4 h-4" /> حفظ الثيم
          </Button>
        </div>
      </form>
    </Modal>
  );
}
