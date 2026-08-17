'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BellRing,
  Users,
  IndianRupee,
  Receipt,
  ArrowLeftRight,
  Image as ImageIcon,
  Images,
  Megaphone,
  CheckSquare,
  MessageSquare,
  BarChart3,
  Settings,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Members', href: '/members', icon: Users, badge: '13' },
  { name: 'Chanda', href: '/chanda', icon: IndianRupee },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Banners', href: '/banners', icon: ImageIcon },
  { name: 'Gallery', href: '/gallery', icon: Images },
  { name: 'Announcements', href: '/announcements', icon: Megaphone },
  { name: 'Notifications', href: '/notifications', icon: BellRing },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-maroon-900 text-white min-h-screen flex flex-col shadow-2xl border-r border-amber-900/30">
      {/* Brand Header */}
      <div className="p-6 border-b border-amber-900/40 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center text-maroon-900 font-extrabold text-xl shadow-lg">
          <Sparkles className="w-6 h-6 text-maroon-900 fill-amber-300" />
        </div>
        <div>
          <h1 className="font-black text-lg tracking-tight text-amber-200">Ganesh Puja</h1>
          <p className="text-[11px] font-medium text-amber-400/80 tracking-wide uppercase">Committee Portal</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group',
                isActive
                  ? 'bg-amber-500 text-maroon-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-amber-100/80 hover:bg-maroon-800 hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-maroon-950' : 'text-amber-400 group-hover:text-amber-300'
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full',
                    isActive ? 'bg-maroon-950 text-amber-300' : 'bg-amber-400/20 text-amber-300'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Branding */}
      <div className="p-4 border-t border-amber-900/30 text-center">
        <p className="text-[11px] text-amber-300/60 font-medium">Shree Ganesh Puja Committee © 2026</p>
      </div>
    </aside>
  );
};

