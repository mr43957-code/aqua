// components/admin/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Settings, Palette, Image, Layers, Package,
  FolderOpen, FileText, ShoppingCart, MessageSquare, FileQuestion,
  Users, Activity, Bell, Globe, ChevronDown, ChevronRight,
  Menu, X, ImageIcon, Wrench, BarChart3, Star
} from 'lucide-react';

interface NavItem {
  href?: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  children?: NavItem[];
}

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: 'عام',
    items: [
      { href: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
      { href: '/admin/notifications', label: 'الإشعارات', icon: Bell },
    ],
  },
  {
    title: 'إدارة الموقع',
    items: [
      { href: '/admin/site-builder', label: 'Site Builder', icon: Globe },
      { href: '/admin/theme-builder', label: 'Theme Builder', icon: Palette },
      { href: '/admin/backgrounds', label: 'الخلفيات', icon: ImageIcon },
      { href: '/admin/slider', label: 'السلايدر', icon: Layers },
      { href: '/admin/media', label: 'مكتبة الوسائط', icon: Image },
    ],
  },
  {
    title: 'المحتوى',
    items: [
      { href: '/admin/services', label: 'الخدمات', icon: Wrench },
      { href: '/admin/products', label: 'المنتجات', icon: Package },
      { href: '/admin/projects', label: 'المشاريع', icon: FolderOpen },
      { href: '/admin/articles', label: 'المدونة', icon: FileText },
      { href: '/admin/testimonials', label: 'آراء العملاء', icon: Star },
      { href: '/admin/faqs', label: 'الأسئلة الشائعة', icon: FileQuestion },
      { href: '/admin/stats', label: 'إحصائيات الموقع', icon: BarChart3 },
    ],
  },
  {
    title: 'العمليات',
    items: [
      { href: '/admin/orders', label: 'الطلبات', icon: ShoppingCart },
      { href: '/admin/quotes', label: 'طلبات عروض السعر', icon: FileQuestion },
      { href: '/admin/contacts', label: 'رسائل التواصل', icon: MessageSquare },
    ],
  },
  {
    title: 'النظام',
    items: [
      { href: '/admin/users', label: 'المستخدمون', icon: Users },
      { href: '/admin/logs', label: 'سجل النشاطات', icon: Activity },
    ],
  },
];

export default function Sidebar({
  siteSettings,
  notifications = 0,
}: {
  siteSettings?: { site_name?: string | null; site_logo_url?: string | null };
  notifications?: number;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href?: string) => href && (pathname === href || pathname.startsWith(href + '/'));

  const SidebarContent = () => (
    <div className={clsx('flex flex-col h-full', collapsed ? 'w-16' : 'w-64')}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-primary-800">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm truncate">{siteSettings?.site_name ?? 'أكواتك CMS'}</p>
            <p className="text-primary-300 text-xs">لوحة التحكم</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mr-auto text-primary-300 hover:text-white hidden lg:block"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 rotate-90" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="text-primary-400 text-[10px] font-semibold uppercase tracking-wider px-3 mb-1">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.href ?? item.label}
                  href={item.href ?? '#'}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm',
                    isActive(item.href)
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-primary-200 hover:bg-white/10 hover:text-white',
                    collapsed && 'justify-center'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && item.badge ? (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-primary-800">
        <Link
          href="/admin/settings"
          className={clsx(
            'flex items-center gap-3 px-3 py-2 rounded-xl text-primary-200 hover:bg-white/10 hover:text-white transition-all text-sm',
            collapsed && 'justify-center'
          )}
        >
          <Settings className="w-5 h-5" />
          {!collapsed && 'الإعدادات'}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={clsx(
        'hidden lg:flex flex-col bg-primary-950 transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-primary-700 text-white p-3 rounded-full shadow-lg"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative bg-primary-950 w-64 flex flex-col h-full animate-slide-in">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 left-4 text-primary-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
