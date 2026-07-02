// app/admin/site-builder/SiteBuilderForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { saveSiteSettingsAction } from './actions';
import { toast } from 'sonner';
import { FormField, Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ImageUpload from '@/components/admin/ImageUpload';
import { clsx } from 'clsx';
import { Globe, Phone, Share2, Search, LayoutTemplate, Sparkles } from 'lucide-react';
import type { SiteSettings } from '@/types';

const tabs = [
  { key: 'general', label: 'بيانات عامة', icon: Globe },
  { key: 'contact', label: 'التواصل', icon: Phone },
  { key: 'social', label: 'التواصل الاجتماعي', icon: Share2 },
  { key: 'seo', label: 'SEO', icon: Search },
  { key: 'header', label: 'الهيدر', icon: LayoutTemplate },
  { key: 'footer', label: 'الفوتر', icon: LayoutTemplate },
  { key: 'advanced', label: 'متقدم', icon: Sparkles },
] as const;

type RawRow = { key: string; category: string; label?: string | null; type: string };

export default function SiteBuilderForm({
  initialSettings,
  rawRows,
}: {
  initialSettings: SiteSettings;
  rawRows: RawRow[];
}) {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]['key']>('general');
  const [values, setValues] = useState<SiteSettings>(initialSettings);
  const [isPending, startTransition] = useTransition();

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(values).forEach(([k, v]) => formData.append(k, v ?? ''));

    startTransition(async () => {
      try {
        await saveSiteSettingsAction(formData);
        toast.success('تم حفظ الإعدادات بنجاح وتطبيقها على الموقع فوراً');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء الحفظ');
      }
    });
  };

  const fieldsForTab = rawRows.filter((r) => r.category === activeTab);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition',
              activeTab === tab.key ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        {activeTab === 'general' && (
          <>
            <FormField label="شعار الموقع (Logo)">
              <ImageUpload
                value={values.site_logo_url}
                onChange={(url) => handleChange('site_logo_url', url)}
                folder="logo"
              />
            </FormField>
            <FormField label="أيقونة الموقع (Favicon)">
              <ImageUpload
                value={values.site_favicon_url}
                onChange={(url) => handleChange('site_favicon_url', url)}
                folder="favicon"
              />
            </FormField>
          </>
        )}

        {fieldsForTab.map((field) => {
          const value = values[field.key] ?? '';
          if (field.type === 'textarea') {
            return (
              <FormField key={field.key} label={field.label ?? field.key}>
                <Textarea
                  value={value ?? ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  rows={3}
                />
              </FormField>
            );
          }
          if (field.type === 'boolean') {
            return (
              <FormField key={field.key} label={field.label ?? field.key}>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={value === 'true'}
                    onChange={(e) => handleChange(field.key, e.target.checked ? 'true' : 'false')}
                  />
                  <span className="text-sm text-gray-600">تفعيل</span>
                </label>
              </FormField>
            );
          }
          if (field.type === 'image') {
            return (
              <FormField key={field.key} label={field.label ?? field.key}>
                <ImageUpload value={value} onChange={(url) => handleChange(field.key, url)} folder="site" />
              </FormField>
            );
          }
          return (
            <FormField key={field.key} label={field.label ?? field.key}>
              <Input
                type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'phone' ? 'tel' : 'text'}
                value={value ?? ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            </FormField>
          );
        })}

        {fieldsForTab.length === 0 && activeTab !== 'general' && (
          <p className="text-gray-400 text-sm text-center py-6">لا توجد حقول في هذا القسم</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={isPending} size="lg">
          حفظ جميع الإعدادات
        </Button>
      </div>
    </form>
  );
}
