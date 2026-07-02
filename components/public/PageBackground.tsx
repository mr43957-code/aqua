// components/public/PageBackground.tsx
// مكوّن يعرض خلفية الصفحة الديناميكية من قاعدة البيانات
import { getPageBackgroundByKey } from '@/lib/actions/public-data';

const animationClass: Record<string, string> = {
  zoom: 'bg-animate-zoom',
  pan: 'bg-animate-pan',
  fade: 'animate-pulse-slow',
};

export default async function PageBackground({ pageKey }: { pageKey: string }) {
  let bg = null;
  try {
    bg = await getPageBackgroundByKey(pageKey);
  } catch {
    return null;
  }

  if (!bg || !bg.is_active || !bg.file_path) return null;

  const filterStyle = [
    bg.blur_amount ? `blur(${bg.blur_amount}px)` : '',
    bg.brightness !== 1 ? `brightness(${bg.brightness})` : '',
    bg.contrast !== 1 ? `contrast(${bg.contrast})` : '',
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  const overlayOpacity = bg.overlay_opacity ?? 0.4;
  const overlayColor = bg.overlay_color ?? 'rgba(0,0,0,0.4)';

  return (
    // z-0 (ليس z-negative) حتى يظهر فوق الخلفية الافتراضية للـ section
    <div className="absolute inset-0 z-0 overflow-hidden">
      {bg.file_type === 'video' ? (
        <video
          src={bg.file_path}
          autoPlay
          muted
          loop
          playsInline
          className={`w-full h-full object-cover ${animationClass[bg.animation ?? ''] ?? ''}`}
          style={filterStyle ? { filter: filterStyle } : undefined}
        />
      ) : (
        <div
          className={`w-full h-full ${animationClass[bg.animation ?? ''] ?? ''}`}
          style={{
            backgroundImage: `url('${bg.file_path}')`,
            backgroundSize: bg.size ?? 'cover',
            backgroundPosition: bg.position ?? 'center',
            backgroundRepeat: bg.repeat ?? 'no-repeat',
            filter: filterStyle,
          }}
        />
      )}
      {/* طبقة التعتيم */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity,
        }}
      />
    </div>
  );
}
