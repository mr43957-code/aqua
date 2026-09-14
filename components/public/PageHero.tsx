// components/public/PageHero.tsx
// غلاف ترويسة موحد للصفحات الداخلية — بتدرج وموتيڤ موجي
import PageBackground from './PageBackground';

export default function PageHero({
  title,
  subtitle,
  pageKey,
}: {
  title: string;
  subtitle?: string;
  pageKey: string;
}) {
  return (
    <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white py-20 text-center overflow-hidden">
      <PageBackground pageKey={pageKey} />
      {/* توهج خلفي */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_white_0%,_transparent_50%)]" />
      <div className="relative z-10 max-w-3xl mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 animate-fade-zoom">{title}</h1>
        {subtitle && (
          <p className="text-primary-200 text-base md:text-lg leading-relaxed animate-fade-zoom" style={{ animationDelay: '0.15s' }}>{subtitle}</p>
        )}
      </div>
      {/* شريط موجي أسفل الترويسة */}
      <div className="absolute inset-x-0 bottom-0 h-10 text-white">
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-full block">
          <path d="M0,20 C200,40 400,0 600,20 C800,40 1000,0 1200,20 L1200,40 L0,40 Z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}