// app/admin/slider/SliderBuilderClient.tsx
'use client';

import { useState, useTransition } from 'react';
import {
  updateSliderSettingsAction, createSlideAction, updateSlideAction,
  deleteSlideAction, reorderSlidesAction,
} from './actions';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import { FormField, Input, Select, Textarea } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ImageUpload from '@/components/admin/ImageUpload';
import { Plus, GripVertical, Trash2, Settings, Edit } from 'lucide-react';
import Image from 'next/image';
import type { Slider, SliderItem } from '@/types';

export default function SliderBuilderClient({ slider, items }: { slider: Slider | null; items: SliderItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editItem, setEditItem] = useState<SliderItem | 'new' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [orderedItems, setOrderedItems] = useState(items);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  if (!slider) {
    return <p className="text-gray-400">لم يتم العثور على سلايدر الصفحة الرئيسية. تأكد من تطبيق الـ Migrations.</p>;
  }

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    const newOrder = [...orderedItems];
    const [moved] = newOrder.splice(dragIndex, 1);
    newOrder.splice(index, 0, moved);
    setOrderedItems(newOrder);
    setDragIndex(null);
    startTransition(async () => {
      await reorderSlidesAction(newOrder.map((i) => i.id));
      toast.success('تم إعادة ترتيب الشرائح');
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      try {
        await deleteSlideAction(deleteId);
        setOrderedItems((prev) => prev.filter((i) => i.id !== deleteId));
        toast.success('تم حذف الشريحة');
        setDeleteId(null);
      } catch { toast.error('فشل الحذف'); }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-500 text-sm">السحب والإفلات لإعادة الترتيب. التعديلات تنعكس فوراً على الصفحة الرئيسية.</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSettingsOpen(true)}><Settings className="w-4 h-4" /> إعدادات السلايدر</Button>
          <Button onClick={() => setEditItem('new')}><Plus className="w-4 h-4" /> شريحة جديدة</Button>
        </div>
      </div>

      <div className="space-y-3">
        {orderedItems.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 cursor-move"
          >
            <GripVertical className="w-5 h-5 text-gray-300 flex-shrink-0" />
            <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {item.media_url && <Image src={item.media_url} alt={item.title ?? ''} fill className="object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{item.title || 'بدون عنوان'}</p>
              <p className="text-xs text-gray-400 truncate">{item.subtitle}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {item.is_active ? 'مفعّلة' : 'معطّلة'}
            </span>
            <Button size="sm" variant="ghost" onClick={() => setEditItem(item)}><Edit className="w-4 h-4" /></Button>
            <Button size="sm" variant="ghost" onClick={() => setDeleteId(item.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
          </div>
        ))}
        {!orderedItems.length && (
          <p className="text-center text-gray-400 py-10">لا توجد شرائح بعد. اضغط "شريحة جديدة" للبدء.</p>
        )}
      </div>

      {settingsOpen && <SliderSettingsModal slider={slider} onClose={() => setSettingsOpen(false)} />}
      {editItem && (
        <SlideFormModal
          sliderId={slider.id}
          item={editItem === 'new' ? null : editItem}
          onClose={() => setEditItem(null)}
        />
      )}

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={isPending} title="حذف الشريحة" />
    </div>
  );
}

function SliderSettingsModal({ slider, onClose }: { slider: Slider; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await updateSliderSettingsAction(slider.id, formData);
        toast.success('تم حفظ إعدادات السلايدر');
        onClose();
      } catch { toast.error('فشل الحفظ'); }
    });
  };
  return (
    <Modal isOpen onClose={onClose} title="إعدادات السلايدر">
      <form action={handleSubmit} className="space-y-4">
        <label className="flex items-center gap-2"><input type="checkbox" name="is_active" defaultChecked={slider.is_active} /> تفعيل السلايدر</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="autoplay" defaultChecked={slider.autoplay} /> تشغيل تلقائي</label>
        <FormField label="سرعة التبديل (مللي ثانية)">
          <Input type="number" name="autoplay_speed" defaultValue={slider.autoplay_speed} />
        </FormField>
        <label className="flex items-center gap-2"><input type="checkbox" name="show_arrows" defaultChecked={slider.show_arrows} /> إظهار الأسهم</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="show_dots" defaultChecked={slider.show_dots} /> إظهار النقاط</label>
        <FormField label="تأثير الانتقال">
          <Select name="animation" defaultValue={slider.animation}>
            <option value="fade">تلاشي</option>
            <option value="slide">انزلاق</option>
            <option value="zoom">تكبير</option>
          </Select>
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit" loading={isPending}>حفظ</Button>
        </div>
      </form>
    </Modal>
  );
}

function SlideFormModal({ sliderId, item, onClose }: { sliderId: string; item: SliderItem | null; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [mediaUrl, setMediaUrl] = useState(item?.media_url ?? '');

  const handleSubmit = (formData: FormData) => {
    formData.set('media_url', mediaUrl);
    startTransition(async () => {
      try {
        if (item) await updateSlideAction(item.id, formData);
        else await createSlideAction(sliderId, formData);
        toast.success('تم الحفظ بنجاح');
        onClose();
      } catch { toast.error('فشل الحفظ'); }
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={item ? 'تعديل الشريحة' : 'شريحة جديدة'} size="lg">
      <form action={handleSubmit} className="space-y-4">
        <FormField label="صورة / فيديو الشريحة">
          <ImageUpload value={mediaUrl} onChange={setMediaUrl} folder="slider" accept="image/*,video/*" maxSizeMB={20} />
        </FormField>
        <FormField label="نوع الوسائط">
          <Select name="media_type" defaultValue={item?.media_type ?? 'image'}>
            <option value="image">صورة</option>
            <option value="video">فيديو</option>
          </Select>
        </FormField>
        <FormField label="العنوان الرئيسي"><Input name="title" defaultValue={item?.title ?? ''} /></FormField>
        <FormField label="العنوان الفرعي"><Input name="subtitle" defaultValue={item?.subtitle ?? ''} /></FormField>
        <FormField label="الوصف"><Textarea name="description" defaultValue={item?.description ?? ''} rows={2} /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="نص الزر"><Input name="button_text" defaultValue={item?.button_text ?? ''} /></FormField>
          <FormField label="رابط الزر"><Input name="button_url" defaultValue={item?.button_url ?? ''} /></FormField>
        </div>
        <FormField label="محاذاة النص">
          <Select name="text_align" defaultValue={item?.text_align ?? 'center'}>
            <option value="right">يمين</option>
            <option value="center">وسط</option>
            <option value="left">يسار</option>
          </Select>
        </FormField>
        {item && (
          <label className="flex items-center gap-2"><input type="checkbox" name="is_active" defaultChecked={item.is_active} /> مفعّلة</label>
        )}
        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit" loading={isPending}>حفظ الشريحة</Button>
        </div>
      </form>
    </Modal>
  );
}
