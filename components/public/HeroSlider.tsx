// components/public/HeroSlider.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import type { Slider, SliderItem } from '@/types';

export default function HeroSlider({ slider, items }: { slider: Slider; items: SliderItem[] }) {
  const [index, setIndex] = useState(0);
  const activeItems = items.filter((i) => i.is_active);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % activeItems.length),
    [activeItems.length]
  );
  const prev = () =>
    setIndex((i) => (i - 1 + activeItems.length) % activeItems.length);

  useEffect(() => {
    if (!slider.autoplay || activeItems.length < 2) return;
    const timer = setInterval(next, slider.autoplay_speed || 5000);
    return () => clearInterval(timer);
  }, [slider.autoplay, slider.autoplay_speed, next, activeItems.length]);

  if (!activeItems.length) return null;
  const current = activeItems[index];

  return (
    // ← position: relative + overflow: hidden لضمان دفع المحتوى للأسفل (لا يوجد absolute على الغلاف)
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: '500px', height: '70vh', maxHeight: '800px' }}
    >
      {/* الشرائح */}
      {activeItems.map((item, i) => (
        <div
          key={item.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === index ? 1 : 0, zIndex: i === index ? 10 : 5 }}
        >
          {item.media_url ? (
            item.media_type === 'video' ? (
              <video
                src={item.media_url}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={item.media_url}
                alt={item.title ?? ''}
                fill
                priority={i === 0}
                className="object-cover"
                unoptimized
              />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-900 to-primary-700" />
          )}
          {/* طبقة التعتيم */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: item.overlay_color ?? 'rgba(0,0,0,0.45)' }}
          />
        </div>
      ))}

      {/* محتوى الشريحة الحالية */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        style={{
          zIndex: 20,
          color: current.text_color ?? '#fff',
          textAlign: (current.text_align as 'left' | 'right' | 'center') ?? 'center',
        }}
      >
        <div className="max-w-4xl mx-auto animate-fade-in">
          {current.subtitle && (
            <p className="text-sm md:text-base mb-3 opacity-90 font-medium tracking-wide">
              {current.subtitle}
            </p>
          )}
          {current.title && (
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              {current.title}
            </h1>
          )}
          {current.description && (
            <p className="text-base md:text-xl max-w-2xl mx-auto mb-8 opacity-90 leading-relaxed">
              {current.description}
            </p>
          )}
          <div className="flex gap-4 flex-wrap justify-center">
            {current.button_text && current.button_url && (
              <Link
                href={current.button_url}
                className="bg-white text-primary-800 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition shadow-lg text-base"
              >
                {current.button_text}
              </Link>
            )}
            {current.button_secondary_text && current.button_secondary_url && (
              <Link
                href={current.button_secondary_url}
                className="border-2 border-white px-8 py-3 rounded-xl hover:bg-white/10 transition font-semibold text-base"
              >
                {current.button_secondary_text}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* أزرار التنقل */}
      {slider.show_arrows && activeItems.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full transition"
            aria-label="السابق"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={next}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full transition"
            aria-label="التالي"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        </>
      )}

      {/* نقاط التنقل */}
      {slider.show_dots && activeItems.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {activeItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
