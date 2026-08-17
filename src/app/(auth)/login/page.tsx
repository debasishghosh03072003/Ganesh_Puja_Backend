'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('admin@ganeshpuja.org');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, rememberMe }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Invalid credentials');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError('Network or server error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-festive-cream flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative festive background accents */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-maroon-800/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-festive-lg border border-amber-100 overflow-hidden z-10 animate-fade-in">
        {/* Header */}
        <div className="gradient-maroon text-white p-8 text-center relative">
          <div className="w-16 h-16 rounded-2xl gradient-gold mx-auto flex items-center justify-center text-maroon-900 shadow-xl mb-4">
            <Sparkles className="w-10 h-10 fill-amber-200" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-amber-200">Ganesh Puja 2026</h1>
          <p className="text-xs text-amber-300/80 mt-1 uppercase font-semibold tracking-wider">
            Private Committee Management System
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-medium backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Authorized 13 Members Access Only</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Email or Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@ganeshpuja.org or 9876543210"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-medium transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-maroon-700 focus:ring-amber-500 border-gray-300"
              />
              <span>Remember me</span>
            </label>
            <span className="text-gray-400 italic">Default Pass: password123</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl gradient-maroon text-white font-bold text-sm shadow-lg shadow-maroon-900/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Admin Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="bg-amber-50/50 p-4 text-center border-t border-amber-100/60">
          <p className="text-[11px] text-gray-500 font-medium">
            Shree Ganesh Puja Committee Management System 2026
          </p>
        </div>
      </div>
    </div>
  );
}
