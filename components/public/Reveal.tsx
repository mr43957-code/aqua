// components/public/Reveal.tsx
// مكوّن يظهر محتواه بتأثير سلس عند دخوله نطاق الرؤية
'use client';

import { useEffect, useRef, useState } from 'react';

type RevealVariant = 'up' | 'left' | 'right' | 'zoom';

interface RevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
}

const variantClass: Record<RevealVariant, string> = {
  up: '',
  left: 'reveal-left',
  right: 'reveal-right',
  zoom: 'reveal-zoom',
};

export default function Reveal({ children, variant = 'up', delay = 0, className = '' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${variantClass[variant]} ${visible ? 'revealed' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}