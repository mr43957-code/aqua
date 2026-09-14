// components/public/PartnersMarquee.tsx
// عرض لوجوهات شركاء/موردين بحركة أفقية انسيابية لا تنتهي ولا تنقطع
'use client';

import Image from 'next/image';

export type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
};

export default function PartnersMarquee({ partners }: { partners: Partner[] }) {
  if (!partners.length) return null;

  // قائمتان متطابقتان جنباً إلى جنب — عند انتهاء الأولى تكون الثانية قد ظهرت بالكامل
  // فيتحرك الخط إلى المنتصف بدون أي فجوة أو توقف، ثم يعيد نفسه
  const copies = [...partners, ...partners];

  return (
    <section className="py-12 bg-white/40 backdrop-blur-md border-y border-gray-100/50 overflow-hidden" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <h2 className="text-xl font-bold text-center text-gray-700">شركاؤنا وموردونا</h2>
      </div>
      <div className="relative">
        {/* تدرج على الحواف لإخفاء بداية/نهاية الشريط */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />

        {/* حاوية بنصف العرض تماماً — الحركة = -50% فتعود للموضع الأصلي دائماً */}
        <div className="flex animate-marquee w-fit">
          {copies.map((partner, idx) => (
            <a
              key={`${partner.id}-${idx}`}
              href={partner.website_url ?? '#'}
              target={partner.website_url ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center justify-center group px-6"
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