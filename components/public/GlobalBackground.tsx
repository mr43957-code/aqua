// components/public/GlobalBackground.tsx
// خلفية الموقع العامة — صورة/فيديو ثابتة ممتلئة الشاشة بتأثير بلور
// تصميم "انسيابي" يظهر من الجانبين: أطراف الصورة ظاهرة بوضوح، والمنتصف فاتح
// حتى يبقى المحتوى في العمود الأوسط مقروءاً دائماً
// تتحكم بها من لوحة التحكم: إدارة الموقع ← الخلفيات ← "خلفية عامة"
import { getPageBackgroundByKey } from '@/lib/actions/public-data';

export default async function GlobalBackground() {
  let bg = null;
  try {
    bg = await getPageBackgroundByKey('global');
  } catch {
    return null;
  }

  if (!bg || !bg.is_active || !bg.file_path) return null;

  const blurAmount = Math.max(bg.blur_amount ?? 0, 6);
  const filterStyle = [
    `blur(${blurAmount}px)`,
    bg.brightness !== 1 ? `brightness(${bg.brightness})` : '',
    bg.contrast !== 1 ? `contrast(${bg.contrast})` : '',
  ]
    .filter(Boolean)
    .join(' ') || `blur(${blurAmount}px)`;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* الصورة الممهوسة — تمتد خلف كل المحتوى */}
      {bg.file_type === 'video' ? (
        <video
          src={bg.file_path}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: filterStyle, transform: 'scale(1.12)' }}
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
            transform: 'scale(1.12)',
          }}
        />
      )}
      {/* تدرج شعاعي: الأطراف (اليمين واليسار) تُظهر الصورة، والمنتصف فاتح ومقروء */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 80% at center, rgba(255,255,255,0.93) 0%, rgba(255,255,255,0.62) 55%, rgba(255,255,255,0.22) 100%)',
        }}
      />
    </div>
  );
}