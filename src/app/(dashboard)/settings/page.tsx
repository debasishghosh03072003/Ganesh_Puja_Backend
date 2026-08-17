'use client';

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Plus, Trash2, CheckCircle2, Shield } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    committeeName: '',
    pujaYear: '2026',
    pujaDate: '2026-08-25',
    location: '',
    description: '',
    expectedChandaTotal: 130000,
    expectedChandaPerMember: 10000,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchCategories();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      setSaving(false);

      if (data.success) {
        setMessage('System settings saved successfully!');
        setTimeout(() => setMessage(''), 4000);
      } else {
        alert(data.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewCatName('');
        fetchCategories();
      } else {
        alert(data.message || 'Failed to add category');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-festive flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <SettingsIcon className="w-7 h-7 text-amber-600" />
            Committee System Settings
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure committee profile, financial targets, and custom expense categories.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Committee Information Form */}
      <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-3xl border border-amber-100 shadow-festive space-y-6">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
          1. Committee Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Committee Name</label>
            <input
              type="text"
              required
              value={settings.committeeName}
              onChange={(e) => setSettings({ ...settings, committeeName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Puja Year</label>
              <input
                type="text"
                required
                value={settings.pujaYear}
                onChange={(e) => setSettings({ ...settings, pujaYear: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Puja Date</label>
              <input
                type="date"
                required
                value={settings.pujaDate}
                onChange={(e) => setSettings({ ...settings, pujaDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pandal Location</label>
          <input
            type="text"
            value={settings.location}
            onChange={(e) => setSettings({ ...settings, location: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 pt-4">
          2. Financial Targets
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Expected Total Chanda Collection (₹)
            </label>
            <input
              type="number"
              required
              value={settings.expectedChandaTotal}
              onChange={(e) =>
                setSettings({ ...settings, expectedChandaTotal: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Expected Chanda Per Member (13 Members)
            </label>
            <input
              type="number"
              required
              value={settings.expectedChandaPerMember}
              onChange={(e) =>
                setSettings({ ...settings, expectedChandaPerMember: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl gradient-maroon text-white font-bold text-xs shadow-md hover:opacity-95 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>{saving ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Expense Categories Management */}
      <div className="bg-white p-8 rounded-3xl border border-amber-100 shadow-festive space-y-6">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
          3. Custom Expense Categories
        </h2>

        <form onSubmit={handleAddCategory} className="flex gap-3">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Add new custom expense category (e.g. Volunteer Refreshment)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl gradient-maroon text-white font-bold text-xs shadow-md hover:opacity-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Add Category</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c._id}
              className="px-3 py-1.5 rounded-xl bg-amber-50 text-maroon-900 border border-amber-200 text-xs font-bold flex items-center gap-2"
            >
              <span>{c.name}</span>
              {c.isSystem && <span className="text-[9px] text-amber-700 font-extrabold uppercase">(System)</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
