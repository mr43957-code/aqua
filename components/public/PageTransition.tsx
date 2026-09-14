// components/public/PageTransition.tsx
// مكوّن يُدخل كل تنقّل بين الصفحات بحركة سلسة + يبدأ كل صفحة من أعلى
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [animKey, setAnimKey] = useState(pathname);

  useEffect(() => {
    setAnimKey(pathname);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div key={animKey} className="animate-page-in">
      {children}
    </div>
  );
}