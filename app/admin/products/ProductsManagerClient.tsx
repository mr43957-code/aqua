// app/admin/products/ProductsManagerClient.tsx
'use client';

import { useState, useTransition } from 'react';
import {
  createProductAction, updateProductAction, deleteProductAction,
  createCategoryAction, deleteCategoryAction, createBrandAction, deleteBrandAction,
} from './actions';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { FormField, Input, Select, Textarea } from '@/components/ui/Input';
import ImageUpload from '@/components/admin/ImageUpload';
import DataTable, { type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Plus, Edit, Trash2, Star, Tag, Award, Package } from 'lucide-react';
import { clsx } from 'clsx';
import type { Product, ProductCategory, Brand } from '@/types';

export default function ProductsManagerClient({
  products, categories, brands,
}: { products: Product[]; categories: ProductCategory[]; brands: Brand[] }) {
  const [tab, setTab] = useState<'products' | 'categories' | 'brands'>('products');
  const [formOpen, setFormOpen] = useState<Product | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        if (deleteTarget.type === 'product') await deleteProductAction(deleteTarget.id);
        if (deleteTarget.type === 'category') await deleteCategoryAction(deleteTarget.id);
        if (deleteTarget.type === 'brand') await deleteBrandAction(deleteTarget.id);
        toast.success('تم الحذف بنجاح');
        setDeleteTarget(null);
      } catch { toast.error('فشل الحذف'); }
    });
  };

  const productColumns: Column<Product>[] = [
    {
      key: 'name', label: 'المنتج',
      render: (p) => (
        <div className="flex items-center gap-2">
          {p.is_featured && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
          <span className="font-medium">{p.name}</span>
        </div>
      ),
    },
    { key: 'category', label: 'التصنيف', render: (p) => p.category?.name ?? '—' },
    { key: 'price', label: 'السعر', render: (p) => `${p.sale_price ?? p.price} ${p.currency}` },
    { key: 'stock', label: 'المخزون', render: (p) => <StatusBadge status={p.stock_status} /> },
    { key: 'status', label: 'الحالة', render: (p) => <StatusBadge status={p.is_published ? 'completed' : 'pending'} /> },
    {
      key: 'actions', label: '',
      render: (p) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setFormOpen(p)}><Edit className="w-4 h-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteTarget({ type: 'product', id: p.id })}><Trash2 className="w-4 h-4 text-red-500" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: 'products', label: 'المنتجات', icon: Package },
          { key: 'categories', label: 'التصنيفات', icon: Tag },
          { key: 'brands', label: 'العلامات التجارية', icon: Award },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium', tab === t.key ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500')}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setFormOpen('new')}><Plus className="w-4 h-4" /> منتج جديد</Button>
          </div>
          <DataTable data={products} columns={productColumns} searchFields={['name', 'sku']} emptyMessage="لا توجد منتجات بعد" />
        </>
      )}

      {tab === 'categories' && (
        <CategoriesTab categories={categories} onDelete={(id) => setDeleteTarget({ type: 'category', id })} />
      )}

      {tab === 'brands' && (
        <BrandsTab brands={brands} onDelete={(id) => setDeleteTarget({ type: 'brand', id })} />
      )}

      {formOpen && (
        <ProductFormModal
          product={formOpen === 'new' ? null : formOpen}
          categories={categories}
          brands={brands}
          onClose={() => setFormOpen(null)}
        />
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={isPending} title="تأكيد الحذف" />
    </div>
  );
}

function CategoriesTab({ categories, onDelete }: { categories: ProductCategory[]; onDelete: (id: string) => void }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> تصنيف جديد</Button></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border p-4 flex items-center justify-between">
            <span className="font-medium text-sm">{c.name}</span>
            <Button size="sm" variant="ghost" onClick={() => onDelete(c.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
          </div>
        ))}
        {!categories.length && <p className="text-gray-400 col-span-full text-center py-6">لا توجد تصنيفات بعد</p>}
      </div>
      {open && (
        <Modal isOpen onClose={() => setOpen(false)} title="تصنيف جديد">
          <form
            action={(fd) => startTransition(async () => {
              try { await createCategoryAction(fd); toast.success('تم الإضافة'); setOpen(false); }
              catch { toast.error('فشل الإضافة'); }
            })}
            className="space-y-4"
          >
            <FormField label="اسم التصنيف" required><Input name="name" required /></FormField>
            <FormField label="الوصف"><Textarea name="description" rows={2} /></FormField>
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button><Button type="submit" loading={isPending}>حفظ</Button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function BrandsTab({ brands, onDelete }: { brands: Brand[]; onDelete: (id: string) => void }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> علامة تجارية جديدة</Button></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {brands.map((b) => (
          <div key={b.id} className="bg-white rounded-xl border p-4 flex items-center justify-between">
            <span className="font-medium text-sm">{b.name}</span>
            <Button size="sm" variant="ghost" onClick={() => onDelete(b.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
          </div>
        ))}
        {!brands.length && <p className="text-gray-400 col-span-full text-center py-6">لا توجد علامات تجارية بعد</p>}
      </div>
      {open && (
        <Modal isOpen onClose={() => setOpen(false)} title="علامة تجارية جديدة">
          <form
            action={(fd) => startTransition(async () => {
              try { await createBrandAction(fd); toast.success('تم الإضافة'); setOpen(false); }
              catch { toast.error('فشل الإضافة'); }
            })}
            className="space-y-4"
          >
            <FormField label="اسم العلامة التجارية" required><Input name="name" required /></FormField>
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button><Button type="submit" loading={isPending}>حفظ</Button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function ProductFormModal({
  product, categories, brands, onClose,
}: { product: Product | null; categories: ProductCategory[]; brands: Brand[]; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [image, setImage] = useState(product?.image_url ?? '');

  const handleSubmit = (formData: FormData) => {
    formData.set('image_url', image);
    formData.set('gallery', JSON.stringify(product?.gallery ?? []));
    startTransition(async () => {
      try {
        if (product) await updateProductAction(product.id, formData);
        else await createProductAction(formData);
        toast.success('تم الحفظ بنجاح وتطبيقه على المتجر فوراً');
        onClose();
      } catch (err) { toast.error(err instanceof Error ? err.message : 'فشل الحفظ'); }
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={product ? 'تعديل المنتج' : 'منتج جديد'} size="xl">
      <form action={handleSubmit} className="space-y-4">
        <FormField label="صورة المنتج"><ImageUpload value={image} onChange={setImage} folder="products" /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="اسم المنتج" required><Input name="name" required defaultValue={product?.name} /></FormField>
          <FormField label="SKU / الكود"><Input name="sku" defaultValue={product?.sku ?? ''} /></FormField>
        </div>
        <FormField label="وصف مختصر"><Input name="short_description" defaultValue={product?.short_description ?? ''} /></FormField>
        <FormField label="الوصف الكامل"><Textarea name="description" defaultValue={product?.description ?? ''} rows={3} /></FormField>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="السعر" required><Input name="price" type="number" step="0.01" required defaultValue={product?.price} /></FormField>
          <FormField label="سعر الخصم (اختياري)"><Input name="sale_price" type="number" step="0.01" defaultValue={product?.sale_price ?? ''} /></FormField>
          <FormField label="العملة"><Input name="currency" defaultValue={product?.currency ?? 'EGP'} /></FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="التصنيف">
            <Select name="category_id" defaultValue={product?.category_id ?? ''}>
              <option value="">بدون تصنيف</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="العلامة التجارية">
            <Select name="brand_id" defaultValue={product?.brand_id ?? ''}>
              <option value="">بدون علامة</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="حالة المخزون">
            <Select name="stock_status" defaultValue={product?.stock_status ?? 'in_stock'}>
              <option value="in_stock">متوفر</option>
              <option value="out_of_stock">غير متوفر</option>
              <option value="pre_order">طلب مسبق</option>
            </Select>
          </FormField>
          <FormField label="الكمية بالمخزون"><Input name="stock_quantity" type="number" defaultValue={product?.stock_quantity ?? ''} /></FormField>
        </div>

        <div className="border-t pt-4 space-y-4">
          <p className="text-sm font-semibold text-gray-700">SEO</p>
          <FormField label="عنوان SEO"><Input name="meta_title" defaultValue={product?.meta_title ?? ''} /></FormField>
          <FormField label="وصف SEO"><Textarea name="meta_description" defaultValue={product?.meta_description ?? ''} rows={2} /></FormField>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_published" defaultChecked={product?.is_published ?? true} /> منشور</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_featured" defaultChecked={product?.is_featured} /> مميز</label>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit" loading={isPending}>حفظ</Button>
        </div>
      </form>
    </Modal>
  );
}
