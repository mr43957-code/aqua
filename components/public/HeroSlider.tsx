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

  const next = useCallback(() => setIndex((i) => (i + 1) % activeItems.length), [activeItems.length]);
  const prev = () => setIndex((i) => (i - 1 + activeItems.length) % activeItems.length);

  useEffect(() => {
    if (!slider.autoplay || activeItems.length < 2) return;
    const timer = setInterval(next, slider.autoplay_speed || 5000);
    return () => clearInterval(timer);
  }, [slider.autoplay, slider.autoplay_speed, next, activeItems.length]);

  if (!activeItems.length) return null;
  const current = activeItems[index];

  return (
    <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
      {activeItems.map((item, i) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {item.media_type === 'video' ? (
            <video src={item.media_url ?? ''} autoPlay muted loop playsInline className="w-full h-full object-cover" />
          ) : (
            item.media_url && <Image src={item.media_url} alt={item.title ?? ''} fill priority={i === 0} className="object-cover" />
          )}
          <div className="absolute inset-0" style={{ backgroundColor: item.overlay_color ?? 'rgba(0,0,0,0.5)' }} />
        </div>
      ))}

      <div
        className="relative z-20 h-full flex flex-col items-center justify-center px-4"
        style={{ textAlign: (current.text_align as any) ?? 'center', color: current.text_color ?? '#fff' }}
      >
        {current.subtitle && <p className="text-sm md:text-base mb-2 opacity-90">{current.subtitle}</p>}
        {current.title && <h1 className="text-3xl md:text-5xl font-bold mb-4 max-w-3xl">{current.title}</h1>}
        {current.description && <p className="max-w-2xl mb-6 opacity-90">{current.description}</p>}
        <div className="flex gap-4 flex-wrap justify-center">
          {current.button_text && current.button_url && (
            <Link href={current.button_url} className="bg-white text-primary-800 font-semibold px-6 py-3 rounded-lg">
              {current.button_text}
            </Link>
          )}
          {current.button_secondary_text && current.button_secondary_url && (
            <Link href={current.button_secondary_url} className="border border-white px-6 py-3 rounded-lg">
              {current.button_secondary_text}
            </Link>
          )}
        </div>
      </div>

      {slider.show_arrows && activeItems.length > 1 && (
        <>
          <button onClick={prev} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 p-2 rounded-full">
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
          <button onClick={next} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 p-2 rounded-full">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        </>
      )}

      {slider.show_dots && activeItems.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {activeItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-white w-6' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
