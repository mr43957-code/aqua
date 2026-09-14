// app/admin/footer/FooterManagerClient.tsx
'use client';

import { useState, useTransition } from 'react';
import {
  saveFooterColumnAction,
  deleteFooterColumnAction,
  saveFooterLinkAction,
  deleteFooterLinkAction,
} from './actions';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import { FormField, Input, Select } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import {
  Plus, Settings2, Link2, Trash2, Info, Phone, Eye, EyeOff,
} from 'lucide-react';
import type { FooterColumn, FooterLink } from '@/types';

const typeMeta: Record<FooterColumn['col_type'], { label: string; icon: React.ElementType; color: string }> = {
  about: { label: 'نبذة + شعار + سوشيال', icon: Info, color: 'bg-blue-50 text-blue-700' },
  links: { label: 'عنوان + روابط', icon: Link2, color: 'bg-primary-50 text-primary-700' },
  contact: { label: 'بيانات التواصل', icon: Phone, color: 'bg-amber-50 text-amber-700' },
};

export default function FooterManagerClient({ columns }: { columns: FooterColumn[] }) {
  const [editingCol, setEditingCol] = useState<FooterColumn | null>(null);
  const [creatingCol, setCreatingCol] = useState(false);
  const [linksCol, setLinksCol] = useState<FooterColumn | null>(null);

  const sorted = [...columns].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-gray-500">
          أضف، عدّل أو احذف أقسام وروابط الفوتر. يتم تطبيق التغييرات فوراً على الموقع.
        </p>
        <Button onClick={() => setCreatingCol(true)}>
          <Plus className="w-4 h-4" /> إضافة عمود جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sorted.map((col) => {
          const meta = typeMeta[col.col_type] ?? typeMeta.links;
          const Icon = meta.icon;
          const links = (col.footer_links ?? []).sort((a, b) => a.display_order - b.display_order);
          return (
            <div key={col.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-50 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{col.title}</p>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full mt-1 ${meta.color}`}>
                    <Icon className="w-3 h-3" /> {meta.label}
                  </span>
                </div>
                {col.is_active ? (
                  <Eye className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-300 flex-shrink-0" />
                )}
              </div>

              <div className="p-4 space-y-2 flex-1">
                <p className="text-xs text-gray-400">الترتيب: {col.display_order}</p>
                {col.col_type === 'links' ? (
                  <div className="space-y-1">
                    {links.slice(0, 4).map((l) => (
                      <div key={l.id} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="w-1 h-1 bg-primary-600 rounded-full flex-shrink-0" />
                        <span className="truncate flex-1">{l.label}</span>
                        {!l.is_active && <span className="text-gray-300 text-[10px]">(مخفي)</span>}
                      </div>
                    ))}
                    {links.length > 4 && <p className="text-xs text-gray-400">+{links.length - 4} روابط أخرى</p>}
                    {links.length === 0 && <p className="text-xs text-gray-400">لا توجد روابط</p>}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    {col.col_type === 'about' ? 'يُعرض تلقائياً من إعدادات الموقع' : 'يُعرض تلقائياً من إعدادات التواصل'}
                  </p>
                )}
              </div>

              <div className="p-3 pt-0 flex gap-2 flex-wrap">
                {col.col_type === 'links' && (
                  <Button size="sm" variant="outline" onClick={() => setLinksCol(col)}>
                    <Link2 className="w-3.5 h-3.5" /> الروابط ({links.length})
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setEditingCol(col)}>
                  <Settings2 className="w-3.5 h-3.5" /> تعديل
                </Button>
                <ConfirmDeleteColumn id={col.id} title={col.title} />
              </div>
            </div>
          );
        })}
      </div>

      {(creatingCol || editingCol) && (
        <ColumnModal column={editingCol} onClose={() => { setCreatingCol(false); setEditingCol(null); }} />
      )}

      {linksCol && <LinksModal column={linksCol} onClose={() => setLinksCol(null)} />}
    </div>
  );
}

function ConfirmDeleteColumn({ id, title }: { id: string; title: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      className="!text-red-600 !bg-red-50 hover:!bg-red-100"
      loading={isPending}
      onClick={() => {
        if (!window.confirm(`حذف عمود "${title}" وكل روابطه؟`)) return;
        startTransition(async () => {
          try {
            await deleteFooterColumnAction(id);
            toast.success('تم حذف العمود');
          } catch {
            toast.error('فشل حذف العمود');
          }
        });
      }}
    >
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  );
}

function ColumnModal({ column, onClose }: { column: FooterColumn | null; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(column?.title ?? '');
  const [colType, setColType] = useState<FooterColumn['col_type']>(column?.col_type ?? 'links');
  const [order, setOrder] = useState(column?.display_order ?? 1);
  const [isActive, setIsActive] = useState(column?.is_active ?? true);

  const handleSubmit = (formData: FormData) => {
    if (column?.id) formData.set('id', column.id);
    formData.set('title', title);
    formData.set('col_type', colType);
    formData.set('display_order', String(order));
    formData.set('is_active', isActive ? 'on' : '');
    startTransition(async () => {
      try {
        await saveFooterColumnAction(formData);
        toast.success('تم حفظ العمود');
        onClose();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'فشل الحفظ');
      }
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={column ? `تعديل عمود: ${column.title}` : 'إضافة عمود جديد'}>
      <form action={handleSubmit} className="space-y-4">
        <FormField label="عنوان العمود" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="مثال: روابط سريعة" />
        </FormField>
        <FormField label="نوع العمود">
          <Select value={colType} onChange={(e) => setColType(e.target.value as FooterColumn['col_type'])}>
            <option value="links">عنوان + روابط (قابلة للإدارة)</option>
            <option value="about">نبذة عن الموقع + شعار + سوشيال (تلقائي)</option>
            <option value="contact">بيانات التواصل + واتساب (تلقائي)</option>
          </Select>
        </FormField>
        <FormField label="الترتيب" hint="الأصغر يظهر أولاً من اليمين">
          <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </FormField>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          <span className="text-sm text-gray-600">ظهور العمود في الفوتر</span>
        </label>
        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit" loading={isPending}>حفظ</Button>
        </div>
      </form>
    </Modal>
  );
}

function LinksModal({ column, onClose }: { column: FooterColumn; onClose: () => void }) {
  const links = (column.footer_links ?? []).sort((a, b) => a.display_order - b.display_order);
  return (
    <Modal isOpen onClose={onClose} title={`روابط "${column.title}"`} size="lg">
      <div className="space-y-4">
        <LinkForm columnId={column.id} />

        <div className="space-y-2">
          {links.length === 0 && <p className="text-gray-400 text-sm text-center py-6">لا توجد روابط في هذا العمود</p>}
          {links.map((link) => (
            <div key={link.id} className="border border-gray-100 rounded-xl p-3 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 text-sm truncate">{link.label}</p>
                    {!link.is_active && <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">مخفي</span>}
                  </div>
                  <p className="text-xs text-gray-400 truncate" dir="ltr">{link.url}</p>
                  <p className="text-[11px] text-gray-300">الترتيب: {link.display_order}</p>
                </div>
                <DeleteLink id={link.id} />
              </div>
              <LinkForm columnId={column.id} link={link} />
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function LinkForm({ columnId, link }: { columnId: string; link?: FooterLink }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(Boolean(link));
  const [label, setLabel] = useState(link?.label ?? '');
  const [url, setUrl] = useState(link?.url ?? '/');
  const [order, setOrder] = useState(link?.display_order ?? 1);
  const [isActive, setIsActive] = useState(link?.is_active ?? true);

  const handleSubmit = (formData: FormData) => {
    if (link?.id) formData.set('id', link.id);
    formData.set('column_id', columnId);
    formData.set('label', label);
    formData.set('url', url);
    formData.set('display_order', String(order));
    formData.set('is_active', isActive ? 'on' : '');
    startTransition(async () => {
      try {
        await saveFooterLinkAction(formData);
        toast.success('تم حفظ الرابط');
        setOpen(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'فشل الحفظ');
      }
    });
  };

  if (!open) {
    return (
      <div className="flex justify-end">
        <Button size="sm" variant={link ? 'ghost' : 'secondary'} onClick={() => setOpen(true)}>
          <Plus className="w-3.5 h-3.5" /> {link ? 'تعديل الرابط' : 'إضافة رابط جديد'}
        </Button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="border border-primary-200 bg-primary-50/40 rounded-xl p-3 space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <FormField label="النص">
          <Input className="!bg-white" value={label} onChange={(e) => setLabel(e.target.value)} required placeholder="اسم الرابط" />
        </FormField>
        <FormField label="الرابط">
          <Input className="!bg-white" dir="ltr" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="/services" />
        </FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
        <FormField label="الترتيب">
          <Input className="!bg-white" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </FormField>
        <label className="flex items-center gap-2 pb-2">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          <span className="text-sm text-gray-600">رابط نشط</span>
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>إغلاق</Button>
        <Button type="submit" size="sm" loading={isPending}>حفظ الرابط</Button>
      </div>
    </form>
  );
}

function DeleteLink({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      className="!text-red-600 !bg-red-50 hover:!bg-red-100"
      loading={isPending}
      onClick={() => {
        if (!window.confirm('حذف هذا الرابط؟')) return;
        startTransition(async () => {
          try {
            await deleteFooterLinkAction(id);
            toast.success('تم حذف الرابط');
          } catch {
            toast.error('فشل الحذف');
          }
        });
      }}
    >
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  );
}