// app/admin/backgrounds/BackgroundManagerClient.tsx
'use client';

import { useState, useTransition, useMemo } from 'react';
import { updateBackgroundAction } from './actions';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import { FormField, Select } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ImageUpload from '@/components/admin/ImageUpload';
import { Image as ImageIcon, Video, Search, Eye, Settings2 } from 'lucide-react';
import Image from 'next/image';
import type { PageBackground, Media } from '@/types';

export default function BackgroundManagerClient({
  backgrounds, mediaLibrary,
}: { backgrounds: PageBackground[]; mediaLibrary: Media[] }) {
  const [editing, setEditing] = useState<PageBackground | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => backgrounds.filter((b) => b.page_label.toLowerCase().includes(search.toLowerCase())),
    [backgrounds, search]
  );

  return (
    <div className="space-y-6">
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن صفحة..."
          className="w-full border border-gray-200 rounded-lg pr-10 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((bg) => (
          <div key={bg.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="relative h-32 bg-gray-100">
              {bg.file_path ? (
                bg.file_type === 'video' ? (
                  <video src={bg.file_path} className="w-full h-full object-cover" muted />
                ) : (
                  <Image src={bg.file_path} alt={bg.page_label} fill className="object-cover" />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
              {bg.file_path && (
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: bg.overlay_color ?? undefined, opacity: bg.overlay_opacity ?? 0 }}
                />
              )}
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 text-sm">{bg.page_label}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  {bg.file_type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                  {bg.file_path ? 'مفعّلة' : 'بدون خلفية'}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setEditing(bg)}>
                <Settings2 className="w-4 h-4" /> تعديل
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <BackgroundEditModal
          background={editing}
          mediaLibrary={mediaLibrary}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function BackgroundEditModal({
  background, mediaLibrary, onClose,
}: { background: PageBackground; mediaLibrary: Media[]; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [filePath, setFilePath] = useState(background.file_path ?? '');
  const [fileType, setFileType] = useState(background.file_type ?? 'image');
  const [overlayOpacity, setOverlayOpacity] = useState(background.overlay_opacity ?? 0.4);
  const [blur, setBlur] = useState(background.blur_amount ?? 0);
  const [brightness, setBrightness] = useState(background.brightness ?? 1);
  const [showLibrary, setShowLibrary] = useState(false);

  const handleSubmit = (formData: FormData) => {
    formData.set('file_path', filePath);
    formData.set('file_type', fileType);
    startTransition(async () => {
      try {
        await updateBackgroundAction(background.page_key, formData);
        toast.success('تم تحديث الخلفية وتطبيقها فوراً على الموقع');
        onClose();
      } catch {
        toast.error('فشل حفظ الخلفية');
      }
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={`تعديل خلفية: ${background.page_label}`} size="lg">
      <form action={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="رفع ملف جديد">
            <ImageUpload value={filePath} onChange={setFilePath} folder="backgrounds" accept="image/*,video/*" maxSizeMB={20} />
          </FormField>
          <div className="space-y-3">
            <Button type="button" variant="outline" onClick={() => setShowLibrary(!showLibrary)} className="w-full">
              اختيار من مكتبة الوسائط
            </Button>
            <FormField label="نوع الملف">
              <Select value={fileType} onChange={(e) => setFileType(e.target.value)}>
                <option value="image">صورة</option>
                <option value="video">فيديو</option>
              </Select>
            </FormField>
          </div>
        </div>

        {showLibrary && (
          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto border rounded-xl p-3">
            {mediaLibrary.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => { setFilePath(m.file_url); setFileType(m.file_type === 'video' ? 'video' : 'image'); setShowLibrary(false); }}
                className="relative h-16 rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary-500"
              >
                {m.file_type === 'video' ? (
                  <video src={m.file_url} className="w-full h-full object-cover" muted />
                ) : (
                  <Image src={m.file_url} alt={m.original_name} fill className="object-cover" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Live preview */}
        {filePath && (
          <div className="relative h-40 rounded-xl overflow-hidden border">
            {fileType === 'video' ? (
              <video src={filePath} className="w-full h-full object-cover" style={{ filter: `blur(${blur}px) brightness(${brightness})` }} muted autoPlay loop />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url(${filePath})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: `blur(${blur}px) brightness(${brightness})`,
                }}
              />
            )}
            <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
            <span className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded flex items-center gap-1">
              <Eye className="w-3 h-3" /> معاينة فورية
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField label="لون التظليل (Overlay)">
            <input type="color" name="overlay_color" defaultValue="#000000" className="w-full h-10 rounded-lg border" />
          </FormField>
          <FormField label={`شفافية التظليل (${overlayOpacity})`}>
            <input type="range" name="overlay_opacity" min={0} max={1} step={0.05} value={overlayOpacity} onChange={(e) => setOverlayOpacity(Number(e.target.value))} className="w-full" />
          </FormField>
          <FormField label={`التمويه Blur (${blur}px)`}>
            <input type="range" name="blur_amount" min={0} max={20} value={blur} onChange={(e) => setBlur(Number(e.target.value))} className="w-full" />
          </FormField>
          <FormField label={`السطوع Brightness (${brightness})`}>
            <input type="range" name="brightness" min={0.3} max={1.5} step={0.05} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full" />
          </FormField>
          <FormField label="الموضع (Position)">
            <Select name="position" defaultValue={background.position ?? 'center'}>
              <option value="center">وسط</option>
              <option value="top">أعلى</option>
              <option value="bottom">أسفل</option>
            </Select>
          </FormField>
          <FormField label="الحجم (Size)">
            <Select name="size" defaultValue={background.size ?? 'cover'}>
              <option value="cover">تغطية كاملة (Cover)</option>
              <option value="contain">احتواء (Contain)</option>
            </Select>
          </FormField>
          <FormField label="التكرار (Repeat)">
            <Select name="repeat" defaultValue={background.repeat ?? 'no-repeat'}>
              <option value="no-repeat">بدون تكرار</option>
              <option value="repeat">تكرار</option>
            </Select>
          </FormField>
          <FormField label="تأثير حركي (Animation)">
            <Select name="animation" defaultValue={background.animation ?? 'none'}>
              <option value="none">بدون</option>
              <option value="zoom">تكبير بطيء (Zoom)</option>
              <option value="pan">حركة جانبية (Pan)</option>
              <option value="fade">تلاشي (Fade)</option>
            </Select>
          </FormField>
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_active" defaultChecked={background.is_active} />
          <span className="text-sm text-gray-600">تفعيل هذه الخلفية على الموقع</span>
        </label>

        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit" loading={isPending}>حفظ وتطبيق فوراً</Button>
        </div>
      </form>
    </Modal>
  );
}
