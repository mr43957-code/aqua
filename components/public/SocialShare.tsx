// components/public/SocialShare.tsx
'use client';

import { useEffect, useState } from 'react';
import { Share2, Link as LinkIcon, Facebook, Twitter } from 'lucide-react';
import { toast } from 'sonner';

export default function SocialShare({ title }: { title: string }) {
  const [url, setUrl] = useState('');

  useEffect(() => { setUrl(window.location.href); }, []);

  const copy = () => {
    navigator.clipboard.writeText(url);
    toast.success('تم نسخ الرابط');
  };

  if (!url) return null;

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div dir="rtl" className="flex items-center gap-3 py-4 border-t mt-8">
      <span className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
        <Share2 className="w-4 h-4" /> مشاركة:
      </span>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noopener noreferrer"
        className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition" aria-label="Facebook">
        <Facebook className="w-4 h-4" />
      </a>
      <a href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer"
        className="w-8 h-8 bg-sky-500 text-white rounded-lg flex items-center justify-center hover:bg-sky-600 transition" aria-label="Twitter">
        <Twitter className="w-4 h-4" />
      </a>
      <a href={`https://wa.me/?text=${encodedTitle}%20${encoded}`} target="_blank" rel="noopener noreferrer"
        className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center hover:bg-green-600 transition" aria-label="WhatsApp">
        <span className="text-xs font-bold">W</span>
      </a>
      <button onClick={copy}
        className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-200 transition" aria-label="نسخ الرابط">
        <LinkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
