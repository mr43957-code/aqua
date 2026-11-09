// components/public/FloatingButtons.tsx
// مجموعة الأيقونات العائمة: الشات المباشر + واتساب + الهاتف + العودة للأعلى
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Phone, MessageCircle, ArrowUp, X } from 'lucide-react';
import { clsx } from 'clsx';
import LiveChatWidget from './LiveChatWidget';

interface Props {
  whatsapp?: string | null;
  phone?: string | null;
}

export default function FloatingButtons({ whatsapp, phone }: Props) {
  const [showTop, setShowTop] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const handleUnread = useCallback((count: number) => setUnread(count), []);

  const iconButton =
    'w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  return (
    <>
      <div className="fixed bottom-6 left-4 z-[60] flex flex-col items-center gap-2.5" dir="rtl">
        {/* الشات المباشر */}
        <button
          type="button"
          onClick={() => setChatOpen((v) => !v)}
          aria-label={chatOpen ? 'إغلاق المحادثة المباشرة' : 'فتح المحادثة المباشرة'}
          aria-expanded={chatOpen}
          title={chatOpen ? 'إغلاق المحادثة' : 'المحادثة المباشرة'}
          className={clsx(
            iconButton,
            'relative focus-visible:ring-primary-600',
            chatOpen ? 'bg-primary-700' : 'bg-primary-600 hover:bg-primary-700'
          )}
        >
          {chatOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
          {!chatOpen && unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow ring-2 ring-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* واتساب */}
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="تواصل عبر واتساب"
            title="واتساب"
            className={clsx(iconButton, 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-600')}
          >
            <MessageCircle className="w-5 h-5" />
          </a>
        )}

        {/* الهاتف */}
        {phone && (
          <a
            href={`tel:${phone}`}
            aria-label="اتصل بنا"
            title="اتصل بنا"
            className={clsx(iconButton, 'bg-teal-600 hover:bg-teal-700 focus-visible:ring-teal-600')}
          >
            <Phone className="w-5 h-5" />
          </a>
        )}

        {/* العودة للأعلى */}
        {showTop && (
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="العودة للأعلى"
            title="العودة للأعلى"
            className={clsx(
              'w-11 h-11 rounded-full bg-gray-800/80 backdrop-blur-sm text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:bg-gray-900 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-800 focus-visible:ring-offset-2'
            )}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </div>

      <LiveChatWidget
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        onUnreadChange={handleUnread}
      />
    </>
  );
}
