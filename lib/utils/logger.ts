// lib/utils/logger.ts
import { createAdminClient } from '@/lib/supabase/server';

export type LogSeverity = 'info' | 'warning' | 'error' | 'critical';

interface LogEntry {
  userId?: string | null;
  userName?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  entityLabel?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  severity?: LogSeverity;
  ipAddress?: string;
}

export async function logActivity(entry: LogEntry) {
  try {
    const supabase = createAdminClient();
    await supabase.from('activity_logs').insert({
      user_id: entry.userId ?? null,
      user_name: entry.userName ?? null,
      action: entry.action,
      entity_type: entry.entityType ?? null,
      entity_id: entry.entityId ?? null,
      entity_label: entry.entityLabel ?? null,
      old_data: entry.oldData ?? null,
      new_data: entry.newData ?? null,
      ip_address: entry.ipAddress ?? null,
      severity: entry.severity ?? 'info',
    });
  } catch (err) {
    // Log to console if DB fails - prevent circular failures
    console.error('[LOGGER] Failed to write activity log:', err);
  }
}

export async function logError(message: string, context?: Record<string, unknown>) {
  console.error('[ERROR]', message, context);
  try {
    const supabase = createAdminClient();
    await supabase.from('activity_logs').insert({
      action: message,
      new_data: context ?? null,
      severity: 'error',
    });
  } catch {}
}

export async function createNotification(data: {
  type: 'order' | 'contact' | 'quote' | 'system' | 'error';
  title: string;
  message?: string;
  link?: string;
}) {
  try {
    const supabase = createAdminClient();
    // Send to all admins
    const { data: admins } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('is_active', true);

    if (admins && admins.length > 0) {
      await supabase.from('notifications').insert(
        admins.map((a) => ({ ...data, target_user_id: a.id }))
      );
    }
  } catch (err) {
    console.error('[NOTIFICATION] Failed to create notification:', err);
  }
}
