'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, LogOut, User, Menu, ChevronDown, Sparkles } from 'lucide-react';
import { navigationItems } from './Sidebar';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          setCurrentUser(data.data.user);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const activeItem = navigationItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  const pageTitle = activeItem ? activeItem.name : 'Dashboard';

  return (
    <header className="h-20 bg-white border-b border-amber-100/80 px-4 md:px-8 flex items-center justify-between shadow-sm sticky top-0 z-30">
      {/* Mobile Menu Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-maroon-800 hover:bg-amber-50 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <nav className="text-xs text-gray-500 font-medium hidden sm:flex items-center gap-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-amber-700 font-semibold">{pageTitle}</span>
          </nav>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            {pageTitle}
          </h2>
        </div>
      </div>

      {/* Right Navbar Utilities */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Notification Icon */}
        <div className="relative">
          <button className="p-2.5 rounded-full text-gray-600 hover:text-maroon-800 hover:bg-amber-50 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white"></span>
          </button>
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-amber-50/80 transition-colors border border-amber-100"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-maroon-700 text-amber-300 font-bold flex items-center justify-center border-2 border-amber-400">
              {currentUser?.profileImage ? (
                <img
                  src={currentUser.profileImage}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{currentUser?.name?.charAt(0) || 'A'}</span>
              )}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-gray-900 leading-tight">
                {currentUser?.name || 'Committee Admin'}
              </p>
              <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
                {currentUser?.role || 'Admin'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-amber-100 py-2 z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push('/settings');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-amber-50 transition-colors"
              >
                <User className="w-4 h-4 text-amber-600" />
                <span>My Profile & Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors border-t border-gray-100"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
