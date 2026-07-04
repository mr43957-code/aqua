// app/admin/media/MediaLibraryClient.tsx
'use client';

import { useState, useRef, useTransition, useMemo } from 'react';
import { deleteMediaAction, updateMediaMetaAction } from './actions';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { FormField, Input } from '@/components/ui/Input';
import { Upload, Search, Trash2, FileText, Video, File as FileIcon, Edit, Copy } from 'lucide-react';
import { formatFileSize, formatDate } from '@/lib/utils/helpers';
import Image from 'next/image';
import { clsx } from 'clsx';
import type { Media } from '@/types';

const FOLDERS = ['الكل', 'general', 'products', 'projects', 'services', 'articles', 'slider', 'backgrounds', 'site', 'logo'];

export default function MediaLibraryClient({ media }: { media: Media[] }) {
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('الكل');
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null);
  const [editTarget, setEditTarget] = useState<Media | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => media.filter((m) => {
    const matchesFolder = folder === 'الكل' || m.folder === folder;
    const matchesSearch = m.original_name.toLowerCase().includes(search.toLowerCase());
    return matchesFolder && matchesSearch;
  }), [media, folder, search]);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder === 'الكل' ? 'general' : folder);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error();
      } catch {
        toast.error(`فشل رفع ${file.name}`);
      }
    }
    setUploading(false);
    toast.success('تم رفع الملفات، يتم تحديث القائمة...');
    window.location.reload();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await deleteMediaAction(deleteTarget.id, deleteTarget.file_path);
        toast.success('تم حذف الملف');
        setDeleteTarget(null);
      } catch { toast.error('فشل الحذف'); }
    });
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('تم نسخ الرابط');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {FOLDERS.map((f) => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition',
                folder === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <Button onClick={() => inputRef.current?.click()} loading={uploading}>
          <Upload className="w-4 h-4" /> رفع ملفات
        </Button>
        <input
          ref={inputRef} type="file" multiple className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
        />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن ملف..."
          className="w-full border border-gray-200 rounded-lg pr-10 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group">
            <div className="relative h-28 bg-gray-50 flex items-center justify-center">
              {item.file_type === 'image' ? (
                <Image src={item.file_url} alt={item.alt_text ?? item.original_name} fill className="object-cover" />
              ) : item.file_type === 'video' ? (
                <Video className="w-8 h-8 text-gray-300" />
              ) : (
                <FileIcon className="w-8 h-8 text-gray-300" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                <button onClick={() => copyUrl(item.file_url)} className="bg-white p-1.5 rounded-lg hover:bg-gray-100" title="نسخ الرابط">
                  <Copy className="w-3.5 h-3.5 text-gray-700" />
                </button>
                <button onClick={() => setEditTarget(item)} className="bg-white p-1.5 rounded-lg hover:bg-gray-100" title="تعديل">
                  <Edit className="w-3.5 h-3.5 text-gray-700" />
                </button>
                <button onClick={() => setDeleteTarget(item)} className="bg-white p-1.5 rounded-lg hover:bg-gray-100" title="حذف">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </div>
            <div className="p-2">
              <p className="text-xs font-medium text-gray-700 truncate">{item.original_name}</p>
              <p className="text-[10px] text-gray-400">{formatFileSize(item.file_size)} — {formatDate(item.created_at)}</p>
            </div>
          </div>
        ))}
        {!filtered.length && (
          <p className="col-span-full text-center text-gray-400 py-12">لا توجد ملفات مطابقة</p>
        )}
      </div>

      {editTarget && (
        <Modal isOpen onClose={() => setEditTarget(null)} title="تعديل بيانات الملف">
          <form
            action={(formData) => startTransition(async () => {
              try {
                await updateMediaMetaAction(editTarget.id, formData);
                toast.success('تم التحديث');
                setEditTarget(null);
              } catch { toast.error('فشل التحديث'); }
            })}
            className="space-y-4"
          >
            <FormField label="النص البديل (Alt Text)"><Input name="alt_text" defaultValue={editTarget.alt_text ?? ''} /></FormField>
            <FormField label="التعليق (Caption)"><Input name="caption" defaultValue={editTarget.caption ?? ''} /></FormField>
            <FormField label="المجلد (Folder)">
              <Input name="folder" defaultValue={editTarget.folder} />
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>إلغاء</Button>
              <Button type="submit" loading={isPending}>حفظ</Button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} loading={isPending}
        title="حذف الملف" message="سيتم حذف الملف نهائياً من التخزين. هل أنت متأكد؟"
      />
    </div>
  );
}
