// app/admin/users/UsersManagerClient.tsx
'use client';

import { useState, useTransition } from 'react';
import { inviteUserAction, updateUserRoleAction, deleteUserAction } from './actions';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { FormField, Input, Select } from '@/components/ui/Input';
import { Plus, Trash2, ShieldAlert } from 'lucide-react';
import { formatDate } from '@/lib/utils/helpers';
import type { AdminProfile, UserRole } from '@/types';

const roleLabels: Record<UserRole, string> = {
  super_admin: 'مدير النظام (Super Admin)',
  admin: 'مدير (Admin)',
  editor: 'محرر (Editor)',
  content_manager: 'مدير محتوى (Content Manager)',
  viewer: 'مشاهد (Viewer)',
};

const roleColors: Record<UserRole, string> = {
  super_admin: 'bg-red-100 text-red-700',
  admin: 'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  content_manager: 'bg-green-100 text-green-700',
  viewer: 'bg-gray-100 text-gray-600',
};

export default function UsersManagerClient({
  users, currentUserId, isSuperAdmin,
}: { users: AdminProfile[]; currentUserId: string; isSuperAdmin: boolean }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminProfile | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isSuperAdmin) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-center gap-3 text-amber-800">
        <ShieldAlert className="w-6 h-6 flex-shrink-0" />
        <p className="text-sm">إدارة المستخدمين متاحة فقط لمدير النظام (Super Admin). تواصل مع مدير النظام لتعديل الصلاحيات.</p>
      </div>
    );
  }

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      try { await deleteUserAction(deleteTarget.id); toast.success('تم حذف المستخدم'); setDeleteTarget(null); }
      catch (err) { toast.error(err instanceof Error ? err.message : 'فشل الحذف'); }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setInviteOpen(true)}><Plus className="w-4 h-4" /> مستخدم جديد</Button>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-right">الاسم</th>
              <th className="px-4 py-3 text-right">الصلاحية</th>
              <th className="px-4 py-3 text-right">الحالة</th>
              <th className="px-4 py-3 text-right">آخر دخول</th>
              <th className="px-4 py-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium">{u.full_name} {u.id === currentUserId && <span className="text-xs text-gray-400">(أنت)</span>}</td>
                <td className="px-4 py-3">
                  <form
                    action={(fd) => startTransition(async () => {
                      try { await updateUserRoleAction(u.id, fd); toast.success('تم التحديث'); }
                      catch (err) { toast.error(err instanceof Error ? err.message : 'فشل'); }
                    })}
                    className="inline-flex items-center gap-2"
                  >
                    <select name="role" defaultValue={u.role} className={`text-xs px-2 py-1 rounded-full border-0 ${roleColors[u.role]}`} onChange={(e) => e.target.form?.requestSubmit()}>
                      {Object.entries(roleLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <input type="hidden" name="is_active" value={u.is_active ? 'on' : ''} />
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form
                    action={(fd) => startTransition(async () => {
                      fd.set('role', u.role);
                      try { await updateUserRoleAction(u.id, fd); toast.success('تم التحديث'); }
                      catch { toast.error('فشل'); }
                    })}
                  >
                    <label className="flex items-center gap-1.5 text-xs">
                      <input type="checkbox" name="is_active" defaultChecked={u.is_active} onChange={(e) => e.target.form?.requestSubmit()} />
                      {u.is_active ? 'مفعّل' : 'معطّل'}
                    </label>
                  </form>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{formatDate(u.last_login_at)}</td>
                <td className="px-4 py-3">
                  {u.id !== currentUserId && (
                    <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(u)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {inviteOpen && (
        <Modal isOpen onClose={() => setInviteOpen(false)} title="إضافة مستخدم جديد">
          <form
            action={(fd) => startTransition(async () => {
              try { await inviteUserAction(fd); toast.success('تم إنشاء المستخدم'); setInviteOpen(false); }
              catch (err) { toast.error(err instanceof Error ? err.message : 'فشل الإنشاء'); }
            })}
            className="space-y-4"
          >
            <FormField label="الاسم الكامل" required><Input name="full_name" required /></FormField>
            <FormField label="البريد الإلكتروني" required><Input name="email" type="email" required /></FormField>
            <FormField label="كلمة المرور المبدئية" required hint="8 أحرف على الأقل"><Input name="password" type="password" required minLength={8} /></FormField>
            <FormField label="الصلاحية">
              <Select name="role" defaultValue="editor">
                {Object.entries(roleLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </FormField>
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>إلغاء</Button>
              <Button type="submit" loading={isPending}>إنشاء المستخدم</Button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={isPending} title="حذف المستخدم" message="سيتم حذف هذا المستخدم نهائياً وفقدان وصوله للوحة التحكم." />
    </div>
  );
}
