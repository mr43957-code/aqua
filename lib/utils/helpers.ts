// lib/utils/helpers.ts

export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u0600-\u06FF]/g, (char) => {
      const map: Record<string, string> = {
        'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
        'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's',
        'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
        'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y',
        'ة': 'a', 'ى': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'a', 'ئ': 'y', 'ء': '',
        'ؤ': 'w', 'لا': 'la',
      };
      return map[char] ?? char;
    })
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function uniqueSlug(base: string): string {
  const ts = Date.now().toString(36);
  return `${slugify(base)}-${ts}`;
}

export function formatDate(date: string | null | undefined, locale = 'ar-EG'): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateShort(date: string | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(date));
}

export function truncate(text: string | null | undefined, length = 100): string {
  if (!text) return '';
  return text.length > length ? text.slice(0, length) + '...' : text;
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  pending: 'bg-orange-100 text-orange-700',
  contacted: 'bg-blue-100 text-blue-700',
  quoted: 'bg-purple-100 text-purple-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  unread: 'bg-blue-100 text-blue-700',
  read: 'bg-gray-100 text-gray-700',
  replied: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
  in_stock: 'bg-green-100 text-green-700',
  out_of_stock: 'bg-red-100 text-red-700',
  pre_order: 'bg-yellow-100 text-yellow-700',
  planning: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
};

export const STATUS_LABELS: Record<string, string> = {
  new: 'جديد', processing: 'قيد المعالجة', shipped: 'تم الشحن',
  completed: 'مكتمل', cancelled: 'ملغي', pending: 'قيد الانتظار',
  contacted: 'تم التواصل', quoted: 'أُرسل عرض', accepted: 'مقبول',
  rejected: 'مرفوض', unread: 'غير مقروءة', read: 'مقروءة',
  replied: 'تم الرد', archived: 'مؤرشف', in_stock: 'متوفر',
  out_of_stock: 'غير متوفر', pre_order: 'طلب مسبق',
  planning: 'تخطيط', in_progress: 'جارٍ التنفيذ',
};
