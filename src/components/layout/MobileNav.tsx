'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Sparkles } from 'lucide-react';
import { navigationItems } from './Sidebar';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs bg-maroon-900 text-white min-h-screen flex flex-col shadow-2xl z-50">
        <div className="p-5 border-b border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center text-maroon-900 font-extrabold">
              <Sparkles className="w-5 h-5 text-maroon-900 fill-amber-300" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-amber-200">Ganesh Puja</h1>
              <p className="text-[10px] text-amber-400/80 uppercase">Committee</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:bg-maroon-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all',
                  isActive
                    ? 'bg-amber-500 text-maroon-950 font-bold'
                    : 'text-amber-100/80 hover:bg-maroon-800 hover:text-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('w-5 h-5', isActive ? 'text-maroon-950' : 'text-amber-400')} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
