// components/public/PartnersMarquee.tsx
// عرض لوجوهات شركاء/موردين بحركة أوتوماتيكية لا نهاية لها
'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

export type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
};

export default function PartnersMarquee({ partners }: { partners: Partner[] }) {
  if (!partners.length) return null;

  // نُكرر القائمة 3 مرات لضمان حركة سلسة لا نهاية لها
  const duplicated = [...partners, ...partners, ...partners];

  return (
    <section className="py-12 bg-white border-y border-gray-100 overflow-hidden" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <h2 className="text-xl font-bold text-center text-gray-700">شركاؤنا وموردونا</h2>
      </div>
      <div className="relative">
        {/* تدرج على الحواف لإخفاء الحواف */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee gap-12 w-max">
          {duplicated.map((partner, idx) => (
            <a
              key={`${partner.id}-${idx}`}
              href={partner.website_url ?? '#'}
              target={partner.website_url ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center justify-center group"
            >
              {partner.logo_url ? (
                <div className="relative w-32 h-16 grayscale group-hover:grayscale-0 transition-all duration-300">
                  <Image
                    src={partner.logo_url}
                    alt={partner.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <span className="text-gray-400 font-semibold text-sm whitespace-nowrap group-hover:text-primary-600 transition-colors px-4 py-2 border border-gray-200 rounded-lg">
                  {partner.name}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
