// app/admin/products/actions.ts
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { uniqueSlug } from '@/lib/utils/helpers';
import { logActivity } from '@/lib/utils/logger';

// ===== PRODUCTS =====
export async function createProductAction(formData: FormData) {
  const admin = createAdminClient();
  const name = String(formData.get('name') || '');
  const gallery = String(formData.get('gallery') || '[]');

  const { data, error } = await admin.from('products').insert({
    name,
    slug: uniqueSlug(name),
    sku: String(formData.get('sku') || '') || null,
    description: String(formData.get('description') || ''),
    short_description: String(formData.get('short_description') || ''),
    price: Number(formData.get('price') || 0),
    sale_price: formData.get('sale_price') ? Number(formData.get('sale_price')) : null,
    currency: String(formData.get('currency') || 'EGP'),
    category_id: String(formData.get('category_id') || '') || null,
    brand_id: String(formData.get('brand_id') || '') || null,
    stock_status: String(formData.get('stock_status') || 'in_stock'),
    stock_quantity: formData.get('stock_quantity') ? Number(formData.get('stock_quantity')) : null,
    image_url: String(formData.get('image_url') || '') || null,
    gallery: JSON.parse(gallery || '[]'),
    meta_title: String(formData.get('meta_title') || '') || null,
    meta_description: String(formData.get('meta_description') || '') || null,
    is_published: formData.get('is_published') === 'on',
    is_featured: formData.get('is_featured') === 'on',
  }).select().single();

  if (error) throw new Error(error.message);
  await logActivity({ action: 'إضافة منتج جديد', entityType: 'products', entityId: data?.id, entityLabel: name, severity: 'info' });

  revalidatePath('/admin/products');
  revalidatePath('/products');
  revalidatePath('/');
}

export async function updateProductAction(id: string, formData: FormData) {
  const admin = createAdminClient();
  const gallery = String(formData.get('gallery') || '[]');
  const name = String(formData.get('name') || '');

  const { error } = await admin.from('products').update({
    name,
    sku: String(formData.get('sku') || '') || null,
    description: String(formData.get('description') || ''),
    short_description: String(formData.get('short_description') || ''),
    price: Number(formData.get('price') || 0),
    sale_price: formData.get('sale_price') ? Number(formData.get('sale_price')) : null,
    currency: String(formData.get('currency') || 'EGP'),
    category_id: String(formData.get('category_id') || '') || null,
    brand_id: String(formData.get('brand_id') || '') || null,
    stock_status: String(formData.get('stock_status') || 'in_stock'),
    stock_quantity: formData.get('stock_quantity') ? Number(formData.get('stock_quantity')) : null,
    image_url: String(formData.get('image_url') || '') || null,
    gallery: JSON.parse(gallery || '[]'),
    meta_title: String(formData.get('meta_title') || '') || null,
    meta_description: String(formData.get('meta_description') || '') || null,
    is_published: formData.get('is_published') === 'on',
    is_featured: formData.get('is_featured') === 'on',
    updated_at: new Date().toISOString(),
  }).eq('id', id);

  if (error) throw new Error(error.message);
  await logActivity({ action: 'تعديل منتج', entityType: 'products', entityId: id, entityLabel: name, severity: 'info' });

  revalidatePath('/admin/products');
  revalidatePath('/products');
  revalidatePath('/');
}

export async function deleteProductAction(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
  await logActivity({ action: 'حذف منتج', entityType: 'products', entityId: id, severity: 'warning' });

  revalidatePath('/admin/products');
  revalidatePath('/products');
  revalidatePath('/');
}

// ===== CATEGORIES =====
export async function createCategoryAction(formData: FormData) {
  const admin = createAdminClient();
  const name = String(formData.get('name') || '');
  const { error } = await admin.from('product_categories').insert({
    name,
    slug: uniqueSlug(name),
    description: String(formData.get('description') || ''),
    image_url: String(formData.get('image_url') || '') || null,
    parent_id: String(formData.get('parent_id') || '') || null,
    is_active: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/products');
  revalidatePath('/products');
}

export async function deleteCategoryAction(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('product_categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/products');
}

// ===== BRANDS =====
export async function createBrandAction(formData: FormData) {
  const admin = createAdminClient();
  const name = String(formData.get('name') || '');
  const { error } = await admin.from('brands').insert({
    name,
    slug: uniqueSlug(name),
    logo_url: String(formData.get('logo_url') || '') || null,
    is_active: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/products');
}

export async function deleteBrandAction(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('brands').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/products');
}
