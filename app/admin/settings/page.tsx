// app/admin/settings/page.tsx
import { redirect } from 'next/navigation';

export default function SettingsRedirect() {
  redirect('/admin/site-builder');
}
