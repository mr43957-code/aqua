// app/admin/stats/StatsManagerClient.tsx
'use client';

import { useState, useTransition } from 'react';
import { createStatAction, updateStatAction, deleteStatAction } from './actions';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, Save } from 'lucide-react';
import type { Stat } from '@/types';

export default function StatsManagerClient({ stats }: { stats: Stat[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4 max-w-2xl">
      {stats.map((s) => (
        <form
          key={s.id}
          action={(fd) => startTransition(async () => {
            try { await updateStatAction(s.id, fd); toast.success('تم الحفظ'); } catch { toast.error('فشل'); }
          })}
          className="bg-white rounded-xl border p-4 flex items-center gap-3"
        >
          <Input name="label" defaultValue={s.label} placeholder="التسمية" className="flex-1" />
          <Input name="value" defaultValue={s.value} placeholder="القيمة" className="w-24" />
          <Input name="suffix" defaultValue={s.suffix ?? ''} placeholder="+" className="w-16" />
          <Button type="submit" size="sm" variant="outline" loading={isPending}><Save className="w-4 h-4" /></Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => startTransition(async () => { await deleteStatAction(s.id); toast.success('تم الحذف'); })}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </form>
      ))}

      <form
        action={(fd) => startTransition(async () => {
          try { await createStatAction(fd); toast.success('تمت الإضافة'); } catch { toast.error('فشل'); }
        })}
        className="bg-gray-50 rounded-xl border border-dashed p-4 flex items-center gap-3"
      >
        <Input name="label" placeholder="تسمية جديدة (مثال: مشروع منجز)" className="flex-1" />
        <Input name="value" placeholder="القيمة (مثال: 250)" className="w-24" />
        <Input name="suffix" placeholder="+" className="w-16" />
        <Button type="submit" size="sm" loading={isPending}><Plus className="w-4 h-4" /> إضافة</Button>
      </form>
    </div>
  );
}
