'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Bell,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDate } from '@/lib/utils';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnounce, setEditingAnnounce] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'Normal',
    publishDate: new Date().toISOString().split('T')[0],
    status: 'Published',
  });

  // Confirm Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements?status='); // fetch all statuses for admin
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.data || []);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenAddModal = () => {
    setEditingAnnounce(null);
    setFormData({
      title: '',
      message: '',
      priority: 'Normal',
      publishDate: new Date().toISOString().split('T')[0],
      status: 'Published',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (a: any) => {
    setEditingAnnounce(a);
    setFormData({
      title: a.title,
      message: a.message,
      priority: a.priority,
      publishDate: new Date(a.publishDate).toISOString().split('T')[0],
      status: a.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      alert('Title and Message content are required');
      return;
    }

    setActionLoading(true);

    try {
      const url = editingAnnounce ? `/api/announcements/${editingAnnounce._id}` : '/api/announcements';
      const method = editingAnnounce ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setActionLoading(false);

      if (data.success) {
        setModalOpen(false);
        fetchAnnouncements();
      } else {
        alert(data.message || 'Failed to save announcement');
      }
    } catch (err) {
      console.error(err);
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/announcements/${itemToDelete._id}`, { method: 'DELETE' });
      const data = await res.json();
      setActionLoading(false);
      if (data.success) {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        fetchAnnouncements();
      } else {
        alert(data.message || 'Failed to delete announcement');
      }
    } catch (err) {
      console.error(err);
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-amber-100 shadow-festive">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-amber-600" />
            Committee Announcements
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Broadcast notices, meeting schedules, and urgent updates to all 13 committee members & mobile app.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-xl gradient-maroon text-white font-bold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-xs text-gray-400 text-center py-12 animate-pulse">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-12">No announcements created yet.</p>
        ) : (
          announcements.map((a) => {
            const isUrgent = a.priority === 'Urgent';
            const isImportant = a.priority === 'Important';
            return (
              <div
                key={a._id}
                className="bg-white p-6 rounded-3xl border border-amber-100 shadow-festive hover:shadow-festive-lg transition-all duration-300 flex flex-col md:flex-row justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 ${
                      isUrgent
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : isImportant
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {isUrgent ? <AlertTriangle className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-base">{a.title}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isUrgent
                            ? 'bg-rose-600 text-white'
                            : isImportant
                            ? 'bg-amber-500 text-maroon-950'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {a.priority} Priority
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {a.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 mt-2 leading-relaxed whitespace-pre-line font-medium">
                      {a.message}
                    </p>

                    <div className="mt-4 flex items-center gap-4 text-[11px] text-gray-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        Publish: {formatDate(a.publishDate)}
                      </span>
                      <span>By: {a.createdBy?.name || 'Admin'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 md:self-start">
                  <button
                    onClick={() => handleOpenEditModal(a)}
                    className="p-2 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setItemToDelete(a);
                      setDeleteDialogOpen(true);
                    }}
                    className="p-2 rounded-lg text-gray-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Announcement Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAnnounce ? 'Edit Announcement' : 'Publish Announcement'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Notice Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Idol Bringing & Procession Details"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              >
                <option value="Normal">Normal</option>
                <option value="Important">Important</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              >
                <option value="Published">Published (Visible)</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Publish Date</label>
            <input
              type="date"
              required
              value={formData.publishDate}
              onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Message Content</label>
            <textarea
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Enter announcement message details for committee members..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
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
              className="px-6 py-2.5 rounded-xl gradient-maroon text-white font-bold text-xs shadow-md disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : editingAnnounce ? 'Update Notice' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message={`Are you sure you want to delete notice "${itemToDelete?.title}"?`}
        loading={actionLoading}
      />
    </div>
  );
}
