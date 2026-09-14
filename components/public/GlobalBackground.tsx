// components/public/GlobalBackground.tsx
// خلفية الموقع العامة — صورة ثابتة ممتلئة الشاشة بتأثير بلور خلف المحتوى
// تتحكم بها من لوحة التحكم: إدارة الموقع ← الخلفيات (صفحة "عام")
import { getPageBackgroundByKey } from '@/lib/actions/public-data';

export default async function GlobalBackground() {
  let bg = null;
  try {
    bg = await getPageBackgroundByKey('global');
  } catch {
    return null;
  }

  if (!bg || !bg.is_active || !bg.file_path) return null;

  const filterStyle = [
    bg.blur_amount ? `blur(${bg.blur_amount}px)` : 'blur(4px)',
    bg.brightness !== 1 ? `brightness(${bg.brightness})` : '',
    bg.contrast !== 1 ? `contrast(${bg.contrast})` : '',
  ]
    .filter(Boolean)
    .join(' ') || 'blur(4px)';

  const overlayOpacity = bg.overlay_opacity ?? 0.55;
  const overlayColor = bg.overlay_color ?? '#f8fafc';

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {bg.file_type === 'video' ? (
        <video
          src={bg.file_path}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: filterStyle }}
        />
      ) : (
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url('${bg.file_path}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: filterStyle,
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
      />
    </div>
  );
}