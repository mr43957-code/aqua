// components/public/BottomSlider.tsx
// سلايدر سفلي بتصميم مختلف (بطاقات أفقية تتحرك)
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import type { SliderItem } from '@/types';

export default function BottomSlider({ items }: { items: SliderItem[] }) {
  const [index, setIndex] = useState(0);
  const activeItems = items.filter((i) => i.is_active);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % activeItems.length),
    [activeItems.length]
  );
  const prev = () => setIndex((i) => (i - 1 + activeItems.length) % activeItems.length);

  useEffect(() => {
    if (activeItems.length < 2) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, activeItems.length]);

  if (!activeItems.length) return null;

  const current = activeItems[index];

  return (
    <section className="bg-primary-900 py-16 px-4 overflow-hidden" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="relative flex items-center gap-8 rounded-2xl overflow-hidden">
          {/* الصورة */}
          {current.media_url && (
            <div className="relative w-64 h-48 flex-shrink-0 rounded-xl overflow-hidden hidden md:block">
              {current.media_type === 'video' ? (
                <video
                  src={current.media_url}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                />
              ) : (
                <Image
                  src={current.media_url}
                  alt={current.title ?? ''}
                  fill
                  className="object-cover"
                />
              )}
            </div>
          )}

          {/* النص */}
          <div className="flex-1 text-white">
            {current.subtitle && (
              <p className="text-primary-300 text-sm mb-1">{current.subtitle}</p>
            )}
            {current.title && (
              <h3 className="text-2xl md:text-3xl font-bold mb-3">{current.title}</h3>
            )}
            {current.description && (
              <p className="text-primary-200 mb-5 leading-relaxed">{current.description}</p>
            )}
            {current.button_text && current.button_url && (
              <Link
                href={current.button_url}
                className="inline-block bg-white text-primary-800 font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-50 transition"
              >
                {current.button_text}
              </Link>
            )}
          </div>

          {/* التنقل */}
          {activeItems.length > 1 && (
            <div className="absolute left-0 right-0 flex items-center justify-between px-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <button
                onClick={next}
                className="pointer-events-auto bg-white/10 hover:bg-white/30 text-white p-2 rounded-full transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={prev}
                className="pointer-events-auto bg-white/10 hover:bg-white/30 text-white p-2 rounded-full transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* نقاط التنقل */}
        {activeItems.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {activeItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'bg-white w-8' : 'bg-white/30 w-4'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
