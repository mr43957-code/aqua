// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { logActivity } from '@/lib/utils/logger';
import path from 'path';

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'video/mp4', 'video/webm',
  'application/pdf',
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    // Verify auth
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مخوّل' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'لم يتم إرسال ملف' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'نوع الملف غير مدعوم' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'حجم الملف كبير جداً (الحد الأقصى 10MB)' }, { status: 400 });
    }

    const ext = path.extname(file.name) || '.jpg';
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filePath = `${folder}/${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const adminClient = createAdminClient();

    // Upload to Supabase Storage
    const { error: uploadError } = await adminClient.storage
      .from('media')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      // Fallback: save URL-based reference
      console.error('Storage upload failed:', uploadError);
      return NextResponse.json({ error: 'فشل في رفع الملف: ' + uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = adminClient.storage.from('media').getPublicUrl(filePath);

    // Save to media library
    const fileType = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
      ? 'video'
      : file.type === 'application/pdf'
      ? 'document'
      : 'other';

    const { data: mediaRecord } = await adminClient.from('media').insert({
      file_name: safeName,
      original_name: file.name,
      file_path: filePath,
      file_url: publicUrl,
      file_type: fileType,
      mime_type: file.type,
      file_size: file.size,
      folder,
      uploaded_by: user.id,
    }).select().single();

    await logActivity({
      userId: user.id,
      action: 'رفع ملف',
      entityType: 'media',
      entityId: mediaRecord?.id,
      entityLabel: file.name,
      severity: 'info',
    });

    return NextResponse.json({ url: publicUrl, id: mediaRecord?.id, path: filePath });
  } catch (err) {
    console.error('[UPLOAD]', err);
    return NextResponse.json({ error: 'حدث خطأ داخلي' }, { status: 500 });
  }
}
