// components/ui/Card.tsx
import { clsx } from 'clsx';
import { type LucideIcon } from 'lucide-react';

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-white rounded-2xl shadow-sm border border-gray-100', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      {action}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx('p-6', className)}>{children}</div>;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  href?: string;
}

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', iconBg: 'bg-blue-100' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', iconBg: 'bg-green-100' },
  yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', iconBg: 'bg-yellow-100' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', iconBg: 'bg-red-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', iconBg: 'bg-purple-100' },
};

export function StatCard({ label, value, icon: Icon, color = 'blue', href }: StatCardProps) {
  const c = colorMap[color];
  const Wrapper = href ? 'a' : 'div';
  return (
    <Wrapper
      href={href}
      className={clsx('rounded-2xl p-6 flex items-center gap-4 transition-all', c.bg, href && 'hover:shadow-md cursor-pointer')}
    >
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', c.iconBg)}>
        <Icon className={clsx('w-6 h-6', c.icon)} />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </Wrapper>
  );
}
