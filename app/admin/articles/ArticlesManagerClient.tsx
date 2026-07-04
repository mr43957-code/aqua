// app/admin/articles/ArticlesManagerClient.tsx
'use client';

import { useState, useTransition } from 'react';
import { createArticleAction, updateArticleAction, deleteArticleAction, createArticleCategoryAction } from './actions';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { FormField, Input, Select, Textarea } from '@/components/ui/Input';
import ImageUpload from '@/components/admin/ImageUpload';
import DataTable, { type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import type { Article, ArticleCategory } from '@/types';

export default function ArticlesManagerClient({
  articles, categories,
}: { articles: Article[]; categories: ArticleCategory[] }) {
  const [formOpen, setFormOpen] = useState<Article | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      try { await deleteArticleAction(deleteTarget.id); toast.success('تم الحذف'); setDeleteTarget(null); }
      catch { toast.error('فشل الحذف'); }
    });
  };

  const columns: Column<Article>[] = [
    {
      key: 'title', label: 'المقال',
      render: (a) => (
        <div className="flex items-center gap-2">
          {a.is_featured && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
          <span className="font-medium">{a.title}</span>
        </div>
      ),
    },
    { key: 'views', label: 'المشاهدات', render: (a) => a.views_count },
    { key: 'status', label: 'الحالة', render: (a) => <StatusBadge status={a.is_published ? 'completed' : 'pending'} /> },
    {
      key: 'actions', label: '',
      render: (a) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setFormOpen(a)}><Edit className="w-4 h-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(a)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setCatModalOpen(true)}>تصنيفات المدونة</Button>
        <Button onClick={() => setFormOpen('new')}><Plus className="w-4 h-4" /> مقال جديد</Button>
      </div>

      <DataTable data={articles} columns={columns} searchFields={['title']} emptyMessage="لا توجد مقالات بعد" />

      {formOpen && (
        <ArticleFormModal article={formOpen === 'new' ? null : formOpen} categories={categories} onClose={() => setFormOpen(null)} />
      )}

      {catModalOpen && (
        <Modal isOpen onClose={() => setCatModalOpen(false)} title="تصنيفات المدونة">
          <div className="space-y-3">
            {categories.map((c) => <div key={c.id} className="px-3 py-2 bg-gray-50 rounded-lg text-sm">{c.name}</div>)}
            <form
              action={(fd) => startTransition(async () => {
                try { await createArticleCategoryAction(fd); toast.success('تم الإضافة'); }
                catch { toast.error('فشل'); }
              })}
              className="flex gap-2"
            >
              <Input name="name" placeholder="اسم تصنيف جديد" />
              <Button type="submit" size="sm" loading={isPending}>إضافة</Button>
            </form>
          </div>
        </Modal>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={isPending} title="حذف المقال" />
    </div>
  );
}

function ArticleFormModal({
  article, categories, onClose,
}: { article: Article | null; categories: ArticleCategory[]; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [cover, setCover] = useState(article?.cover_image_url ?? '');

  const handleSubmit = (formData: FormData) => {
    formData.set('cover_image_url', cover);
    startTransition(async () => {
      try {
        if (article) await updateArticleAction(article.id, formData);
        else await createArticleAction(formData);
        toast.success('تم الحفظ بنجاح وتطبيقه على المدونة فوراً');
        onClose();
      } catch (err) { toast.error(err instanceof Error ? err.message : 'فشل الحفظ'); }
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={article ? 'تعديل المقال' : 'مقال جديد'} size="xl">
      <form action={handleSubmit} className="space-y-4">
        <FormField label="صورة الغلاف"><ImageUpload value={cover} onChange={setCover} folder="articles" /></FormField>
        <FormField label="عنوان المقال" required><Input name="title" required defaultValue={article?.title} /></FormField>
        <FormField label="مقتطف قصير"><Textarea name="excerpt" defaultValue={article?.excerpt ?? ''} rows={2} /></FormField>
        <FormField label="المحتوى الكامل" required><Textarea name="content" required defaultValue={article?.content} rows={8} /></FormField>
        <FormField label="التصنيف">
          <Select name="category_id" defaultValue={article?.category_id ?? ''}>
            <option value="">بدون تصنيف</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </FormField>

        <div className="border-t pt-4 space-y-4">
          <p className="text-sm font-semibold text-gray-700">SEO</p>
          <FormField label="عنوان SEO"><Input name="meta_title" defaultValue={article?.meta_title ?? ''} /></FormField>
          <FormField label="وصف SEO"><Textarea name="meta_description" defaultValue={article?.meta_description ?? ''} rows={2} /></FormField>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_published" defaultChecked={article?.is_published} /> نشر المقال</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_featured" defaultChecked={article?.is_featured} /> مميز</label>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit" loading={isPending}>حفظ</Button>
        </div>
      </form>
    </Modal>
  );
}
