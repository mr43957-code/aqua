// components/public/PageBackground.tsx
import { getPageBackgroundByKey } from '@/lib/actions/public-data';

const animationClass: Record<string, string> = {
  zoom: 'bg-animate-zoom',
  pan: 'bg-animate-pan',
  fade: 'animate-fade-in',
};

export default async function PageBackground({ pageKey }: { pageKey: string }) {
  const bg = await getPageBackgroundByKey(pageKey);
  if (!bg || !bg.is_active || !bg.file_path) return null;

  const filterStyle = `blur(${bg.blur_amount ?? 0}px) brightness(${bg.brightness ?? 1}) contrast(${bg.contrast ?? 1})`;

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {bg.file_type === 'video' ? (
        <video
          src={bg.file_path}
          autoPlay muted loop playsInline
          className={`w-full h-full object-cover ${animationClass[bg.animation ?? ''] ?? ''}`}
          style={{ filter: filterStyle }}
        />
      ) : (
        <div
          className={`w-full h-full ${animationClass[bg.animation ?? ''] ?? ''}`}
          style={{
            backgroundImage: `url(${bg.file_path})`,
            backgroundSize: bg.size ?? 'cover',
            backgroundPosition: bg.position ?? 'center',
            backgroundRepeat: bg.repeat ?? 'no-repeat',
            filter: filterStyle,
          }}
        />
      )}
      <div className="absolute inset-0" style={{ backgroundColor: bg.overlay_color ?? undefined, opacity: bg.overlay_opacity ?? 0 }} />
    </div>
  );
}
