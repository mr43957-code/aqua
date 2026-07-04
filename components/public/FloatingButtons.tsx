// components/public/FloatingButtons.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, MessageCircle, ArrowUp, X } from 'lucide-react';

interface Props {
  whatsapp?: string | null;
  phone?: string | null;
}

export default function FloatingButtons({ whatsapp, phone }: Props) {
  const [showTop, setShowTop] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="fixed bottom-6 left-4 z-50 flex flex-col items-center gap-3" dir="rtl">
      {/* الأزرار المنبثقة */}
      {open && (
        <div className="flex flex-col gap-2 animate-fade-in">
          {phone && (
            <a href={`tel:${phone}`}
              className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 transition"
              title="اتصل بنا">
              <Phone className="w-5 h-5" />
            </a>
          )}
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
              target="_blank" rel="noopener noreferrer"
              className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition"
              title="واتساب">
              <MessageCircle className="w-5 h-5" />
            </a>
          )}
        </div>
      )}

      {/* زر التواصل الرئيسي */}
      {(phone || whatsapp) && (
        <button onClick={() => setOpen(!open)}
          className="w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-primary-700 transition-all duration-200"
          aria-label="تواصل معنا">
          {open
            ? <X className="w-6 h-6" />
            : <MessageCircle className="w-6 h-6" />}
        </button>
      )}

      {/* العودة للأعلى */}
      {showTop && (
        <button onClick={scrollToTop}
          className="w-11 h-11 bg-gray-800/80 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-900 transition backdrop-blur-sm"
          aria-label="العودة للأعلى">
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
