// components/public/ThemeInjector.tsx
// يُحقن CSS ديناميكي يُعيد تعريف ألوان primary بناءً على الثيم المُفعَّل
import { createClient } from '@/lib/supabase/server';

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function generateShades(hex: string): Record<number, string> {
  // نولّد تدرجات تلقائية بتعديل اللمعة
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const toHex = (n: number) => Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, '0');
  const blend = (factor: number) =>
    `#${toHex(r + (255 - r) * factor)}${toHex(g + (255 - g) * factor)}${toHex(b + (255 - b) * factor)}`;
  const darken = (factor: number) =>
    `#${toHex(r * factor)}${toHex(g * factor)}${toHex(b * factor)}`;
  return {
    50: blend(0.92),
    100: blend(0.85),
    200: blend(0.7),
    300: blend(0.5),
    400: blend(0.25),
    500: hex,
    600: darken(0.85),
    700: darken(0.7),
    800: darken(0.55),
    900: darken(0.4),
    950: darken(0.3),
  };
}

export default async function ThemeInjector() {
  let theme = null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('is_active', true)
      .single();
    theme = data;
  } catch {
    return null;
  }

  if (!theme) return null;

  const primaryColor = theme.primary_color || '#0a8acc';
  const shades = generateShades(primaryColor);

  // نبني CSS يُعيد تعريف متغيرات Tailwind عبر CSS custom properties
  const css = `
    :root {
      --primary-color: ${primaryColor};
      --secondary-color: ${theme.secondary_color || '#0f766e'};
      --accent-color: ${theme.accent_color || '#f59e0b'};
      --bg-color: ${theme.background_color || '#f8fafc'};
      --text-color: ${theme.text_color || '#1e293b'};
      --border-radius: ${theme.border_radius || '0.5rem'};
      --font-family: '${theme.font_family || 'Cairo'}', sans-serif;
    }
    body {
      font-family: var(--font-family);
      background-color: var(--bg-color);
      color: var(--text-color);
    }
    /* إعادة تعريف ألوان primary ديناميكياً */
    ${Object.entries(shades)
      .map(([shade, color]) => `.text-primary-${shade} { color: ${color} !important; }
    .bg-primary-${shade} { background-color: ${color} !important; }
    .border-primary-${shade} { border-color: ${color} !important; }
    .ring-primary-${shade} { --tw-ring-color: ${color} !important; }
    .hover\\:bg-primary-${shade}:hover { background-color: ${color} !important; }
    .hover\\:text-primary-${shade}:hover { color: ${color} !important; }
    .focus\\:ring-primary-${shade}:focus { --tw-ring-color: ${color} !important; }`)
      .join('\n    ')}
    .rounded-lg { border-radius: var(--border-radius) !important; }
    .rounded-xl { border-radius: calc(var(--border-radius) * 1.5) !important; }
    .rounded-2xl { border-radius: calc(var(--border-radius) * 2) !important; }
  `;

  return (
    <style
      id="dynamic-theme"
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
