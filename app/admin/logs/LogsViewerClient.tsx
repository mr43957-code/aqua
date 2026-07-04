// app/admin/logs/LogsViewerClient.tsx
'use client';

import { useMemo, useState } from 'react';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/helpers';
import { clsx } from 'clsx';
import type { ActivityLog } from '@/types';

const severityVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  info: 'info', warning: 'warning', error: 'danger', critical: 'danger',
};
const severityLabel: Record<string, string> = { info: 'معلومة', warning: 'تحذير', error: 'خطأ', critical: 'حرج' };

export default function LogsViewerClient({ logs }: { logs: ActivityLog[] }) {
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filtered = useMemo(
    () => (severityFilter === 'all' ? logs : logs.filter((l) => l.severity === severityFilter)),
    [logs, severityFilter]
  );

  const columns: Column<ActivityLog>[] = [
    { key: 'action', label: 'الإجراء' },
    { key: 'user_name', label: 'المستخدم', render: (l) => l.user_name ?? 'النظام' },
    { key: 'entity', label: 'العنصر', render: (l) => l.entity_label ?? l.entity_type ?? '—' },
    { key: 'severity', label: 'الخطورة', render: (l) => <Badge variant={severityVariant[l.severity]}>{severityLabel[l.severity]}</Badge> },
    { key: 'date', label: 'التاريخ', render: (l) => formatDate(l.created_at) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['all', 'info', 'warning', 'error', 'critical'].map((s) => (
          <button
            key={s}
            onClick={() => setSeverityFilter(s)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium',
              severityFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {s === 'all' ? 'الكل' : severityLabel[s]}
          </button>
        ))}
      </div>

      <DataTable data={filtered} columns={columns} searchFields={['action', 'user_name', 'entity_label']} emptyMessage="لا يوجد نشاط مسجل بعد" pageSize={20} />
    </div>
  );
}
