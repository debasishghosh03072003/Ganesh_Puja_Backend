'use client';

import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Sparkles,
  RefreshCw,
  Clock,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface MemberItem {
  _id: string;
  name: string;
  mobile: string;
  role: string;
  fcmTokens?: { token: string; deviceType: string }[];
}

interface NotificationItem {
  _id: string;
  title: string;
  body: string;
  type: string;
  screen: string;
  recipients: any;
  sentBy?: { name: string; email: string };
  sentAt: string;
  deliveryStats?: {
    total: number;
    success: number;
    failure: number;
    invalidTokensRemoved: number;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    recipientMode: 'all' as 'all' | 'specific',
    selectedMembers: [] as string[],
    screen: 'home',
    type: 'announcement',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [histRes, membRes] = await Promise.all([
        fetch('/api/notifications/history'),
        fetch('/api/members'),
      ]);

      if (histRes.ok) {
        const histData = await histRes.json();
        setNotifications(histData?.data?.notifications || histData?.notifications || []);
      }
      if (membRes.ok) {
        const membData = await membRes.json();
        setMembers(membData?.data?.members || membData?.members || []);
      }
    } catch (err) {
      console.error('Failed to load notifications data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.body.trim()) {
      setFeedback({ type: 'error', message: 'Please provide both title and message' });
      return;
    }

    if (formData.recipientMode === 'specific' && formData.selectedMembers.length === 0) {
      setFeedback({ type: 'error', message: 'Please select at least one member' });
      return;
    }

    try {
      setActionLoading(true);
      setFeedback(null);

      const payload = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        recipients: formData.recipientMode === 'all' ? 'all' : formData.selectedMembers,
        screen: formData.screen,
        type: formData.type,
      };

      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData?.message || 'Failed to send notification');
      }

      setFeedback({
        type: 'success',
        message: resData?.message || 'Notification sent successfully to active member devices!',
      });

      // Reset form
      setFormData({
        title: '',
        body: '',
        recipientMode: 'all',
        selectedMembers: [],
        screen: 'home',
        type: 'announcement',
      });
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to send notification' });
    } finally {
      setActionLoading(false);
    }
  };

  const toggleMemberSelection = (id: string) => {
    setFormData((prev) => {
      const exists = prev.selectedMembers.includes(id);
      return {
        ...prev,
        selectedMembers: exists
          ? prev.selectedMembers.filter((mId) => mId !== id)
          : [...prev.selectedMembers, id],
      };
    });
  };

  // Stats calculation
  const totalSent = notifications.length;
  const totalDelivered = notifications.reduce(
    (acc, n) => acc + (n.deliveryStats?.success || 0),
    0
  );
  const activeDeviceCount = members.reduce(
    (acc, m) => acc + (m.fcmTokens?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-amber-100 shadow-festive">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-maroon-950 flex items-center justify-center font-extrabold shadow-md">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-gray-900 flex items-center gap-2">
              Push Notifications (FCM)
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">
                Active
              </span>
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Broadcast instant push alerts to Android devices with custom Ganesh Puja notification sound.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={fetchData}
            title="Refresh"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setFeedback(null);
              setModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-maroon-950 font-bold text-xs shadow-md transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Send Push Notification</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-bold uppercase">Broadcasts Sent</p>
            <p className="text-xl font-extrabold text-gray-900">{totalSent}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-bold uppercase">Total Deliveries</p>
            <p className="text-xl font-extrabold text-emerald-700">{totalDelivered}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-bold uppercase">Active Registered Devices</p>
            <p className="text-xl font-extrabold text-blue-700">{activeDeviceCount}</p>
          </div>
        </div>
      </div>

      {/* Notification History List */}
      <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-festive space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            Broadcast History
          </h2>
          <span className="text-xs text-gray-400 font-medium">
            {notifications.length} message(s) logged
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-medium">Loading history...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <BellRing className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-gray-600">No notifications sent yet</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Click &quot;Send Push Notification&quot; to broadcast your first alert.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => {
              const dateStr = n.sentAt
                ? new Date(n.sentAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : 'Just now';

              const recipientLabel =
                n.recipients === 'all'
                  ? 'All Members'
                  : Array.isArray(n.recipients)
                  ? `${n.recipients.length} Specific Member(s)`
                  : 'Targeted Members';

              return (
                <div key={n._id} className="py-4 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm">{n.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                        {n.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800">
                        Opens: {n.screen}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed font-medium">
                      {n.body}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                        {recipientLabel}
                      </span>
                      <span>By: {n.sentBy?.name || 'Admin'}</span>
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  {/* Delivery stats badge */}
                  <div className="flex items-center gap-2 self-start md:self-center">
                    <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-right">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Delivered</p>
                      <p className="text-xs font-black text-emerald-700">
                        {n.deliveryStats?.success ?? 0} / {n.deliveryStats?.total ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Send Notification Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Send Push Notification"
      >
        <form onSubmit={handleSendNotification} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Notification Title *
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Ganesh Puja 2026 Morning Aarti"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Message Body *
            </label>
            <textarea
              rows={3}
              required
              maxLength={500}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="e.g. Tomorrow morning puja starts at 8:00 AM. All committee members please be present."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Send To Picker */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
              Send To *
            </label>
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, recipientMode: 'all', selectedMembers: [] })}
                className={`py-2 rounded-lg transition-all ${
                  formData.recipientMode === 'all'
                    ? 'bg-amber-500 text-maroon-950 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Members ({members.length})
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, recipientMode: 'specific' })}
                className={`py-2 rounded-lg transition-all ${
                  formData.recipientMode === 'specific'
                    ? 'bg-amber-500 text-maroon-950 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Specific Member(s)
              </button>
            </div>
          </div>

          {/* Specific Members Checklist */}
          {formData.recipientMode === 'specific' && (
            <div className="border border-gray-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-1.5 bg-gray-50">
              <p className="text-[11px] font-bold text-gray-500 uppercase mb-1">
                Select Members ({formData.selectedMembers.length} selected):
              </p>
              {members.map((m) => {
                const isSelected = formData.selectedMembers.includes(m._id);
                return (
                  <label
                    key={m._id}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white cursor-pointer text-xs font-medium"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleMemberSelection(m._id)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span className="text-gray-800">{m.name}</span>
                    <span className="text-[10px] text-gray-400">({m.mobile})</span>
                  </label>
                );
              })}
            </div>
          )}

          {/* Screen & Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Open Screen on Tap
              </label>
              <select
                value={formData.screen}
                onChange={(e) => setFormData({ ...formData, screen: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              >
                <option value="home">Home Page</option>
                <option value="contribution">Contribution (Chanda)</option>
                <option value="expense">Expense Page</option>
                <option value="gallery">Gallery</option>
                <option value="profile">Profile Page</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Notification Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              >
                <option value="announcement">Announcement</option>
                <option value="puja_reminder">Puja Reminder</option>
                <option value="contribution">Contribution</option>
                <option value="expense">Expense</option>
                <option value="meeting">Meeting</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-maroon-950 font-extrabold text-xs shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{actionLoading ? 'Sending...' : 'SEND NOTIFICATION'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
