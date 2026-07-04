// lib/actions/public-data.ts
import { createClient } from '@/lib/supabase/server';
import type { SiteSettings } from '@/types';

export async function getPublicSiteSettings(): Promise<SiteSettings> {
  const supabase = createClient();
  const { data } = await supabase.from('site_settings').select('key, value');
  return (data ?? []).reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {} as SiteSettings);
}

export async function getMenuItems(location: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('menus')
    .select('*, menu_items(*)')
    .eq('location', location)
    .single();
  if (!data) return [];
  return (data.menu_items ?? [])
    .filter((i: any) => i.is_active)
    .sort((a: any, b: any) => a.sort_order - b.sort_order);
}

export async function getPageBackgroundByKey(pageKey: string) {
  const supabase = createClient();
  const { data } = await supabase.from('page_backgrounds').select('*').eq('page_key', pageKey).single();
  return data;
}
