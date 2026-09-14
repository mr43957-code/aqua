// components/public/ThemeInjector.tsx
// يُحقن CSS ديناميكي في <body> لتطبيق الثيم على الموقع كله
// يستخدم getActiveTheme المخزّنة (بدون كوكيز) — لا تجعل الصفحة ديناميكية
import { getActiveTheme } from '@/lib/actions/public-data';

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
}

function generateShades(hex: string): Record<number, string> {
  if (!hex || !hex.startsWith('#') || hex.length < 7) hex = '#0a8acc';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const toHex = (n: number) =>
    Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, '0');
  const blend = (f: number) =>
    `#${toHex(r + (255 - r) * f)}${toHex(g + (255 - g) * f)}${toHex(b + (255 - b) * f)}`;
  const darken = (f: number) =>
    `#${toHex(r * f)}${toHex(g * f)}${toHex(b * f)}`;
  return {
    50: blend(0.93), 100: blend(0.85), 200: blend(0.7),
    300: blend(0.5),  400: blend(0.25), 500: hex,
    600: darken(0.85), 700: darken(0.7), 800: darken(0.55),
    900: darken(0.4),  950: darken(0.28),
  };
}

export default async function ThemeInjector() {
  let theme: Record<string, string> | null = null;
  try {
    theme = await getActiveTheme();
  } catch { return null; }

  if (!theme) return null;

  const primaryColor  = theme.primary_color  || '#0a8acc';
  const secondaryColor = theme.secondary_color || '#0f766e';
  const accentColor   = theme.accent_color   || '#f59e0b';
  const bgColor       = theme.background_color || '#f8fafc';
  const textColor     = theme.text_color      || '#1e293b';
  const fontFamily    = theme.font_family     || 'Cairo';
  const borderRadius  = theme.border_radius   || '0.5rem';

  const shades = generateShades(primaryColor);

  const colVars = Object.entries(shades)
    .map(([s, c]) => `--tw-primary-${s}:${c};`)
    .join('');

  // نبني CSS شامل يغطي كل استخدامات ألوان primary في Tailwind
  const shadeCSS = Object.entries(shades).flatMap(([s, c]) => [
    `.text-primary-${s}{color:${c}!important}`,
    `.bg-primary-${s}{background-color:${c}!important}`,
    `.border-primary-${s}{border-color:${c}!important}`,
    `.ring-primary-${s}{--tw-ring-color:${c}!important}`,
    `.hover\\:bg-primary-${s}:hover{background-color:${c}!important}`,
    `.hover\\:text-primary-${s}:hover{color:${c}!important}`,
    `.hover\\:border-primary-${s}:hover{border-color:${c}!important}`,
    `.focus\\:ring-primary-${s}:focus{--tw-ring-color:${c}!important}`,
    `.from-primary-${s}{--tw-gradient-from:${c}!important}`,
    `.to-primary-${s}{--tw-gradient-to:${c}!important}`,
    `.via-primary-${s}{--tw-gradient-via:${c}!important}`,
    `.placeholder-primary-${s}::placeholder{color:${c}!important}`,
    `.fill-primary-${s}{fill:${c}!important}`,
    `.stroke-primary-${s}{stroke:${c}!important}`,
    `.decoration-primary-${s}{text-decoration-color:${c}!important}`,
    `.caret-primary-${s}{caret-color:${c}!important}`,
    `.accent-primary-${s}{accent-color:${c}!important}`,
  ]).join('');

  const css = `
:root{
  ${colVars}
  --primary:${primaryColor};
  --secondary:${secondaryColor};
  --accent:${accentColor};
  --site-bg:${bgColor};
  --site-text:${textColor};
  --font:${fontFamily},sans-serif;
  --radius:${borderRadius};
  --radius-lg:calc(${borderRadius} * 1.5);
  --radius-xl:calc(${borderRadius} * 2);
  --radius-2xl:calc(${borderRadius} * 3);
}
body{
  font-family:var(--font)!important;
  background-color:var(--site-bg)!important;
  color:var(--site-text)!important;
}
.rounded-lg{border-radius:var(--radius)!important}
.rounded-xl{border-radius:var(--radius-lg)!important}
.rounded-2xl{border-radius:var(--radius-xl)!important}
.rounded-3xl{border-radius:var(--radius-2xl)!important}
${shadeCSS}
`;

  return (
    // style tag في body — مضمون التطبيق على كل العناصر
    <style
      id="theme-dynamic"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: css.replace(/\s+/g, ' ') }}
    />
  );
}
