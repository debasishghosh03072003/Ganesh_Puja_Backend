'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Upload,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDate } from '@/lib/utils';

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: '',
    buttonAction: '',
    imageUrl: '',
    imagePublicId: '',
    displayOrder: 1,
    status: 'active',
  });

  // Confirm Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners?all=true');
      const data = await res.json();
      if (data.success) {
        setBanners(data.data || []);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setImagePreview('');
    setFormData({
      title: '',
      subtitle: '',
      buttonText: 'View Details',
      buttonAction: '/announcements',
      imageUrl: '',
      imagePublicId: '',
      displayOrder: banners.length + 1,
      status: 'active',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (b: any) => {
    setEditingBanner(b);
    setImagePreview(b.imageUrl);
    setFormData({
      title: b.title,
      subtitle: b.subtitle || '',
      buttonText: b.buttonText || '',
      buttonAction: b.buttonAction || '',
      imageUrl: b.imageUrl,
      imagePublicId: b.imagePublicId || '',
      displayOrder: b.displayOrder || 1,
      status: b.status || 'active',
    });
    setModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const form = new FormData();
    form.append('file', file);
    form.append('folder', 'ganesh_puja/banners');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      setUploadingImage(false);

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: data.data.url,
          imagePublicId: data.data.publicId,
        }));
        setImagePreview(data.data.url);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      alert('Title and Banner Image are required');
      return;
    }

    setActionLoading(true);

    try {
      const url = editingBanner ? `/api/banners/${editingBanner._id}` : '/api/banners';
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setActionLoading(false);

      if (data.success) {
        setModalOpen(false);
        fetchBanners();
      } else {
        alert(data.message || 'Failed to save banner');
      }
    } catch (err) {
      console.error(err);
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!bannerToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/banners/${bannerToDelete._id}`, { method: 'DELETE' });
      const data = await res.json();
      setActionLoading(false);
      if (data.success) {
        setDeleteDialogOpen(false);
        setBannerToDelete(null);
        fetchBanners();
      } else {
        alert(data.message || 'Failed to delete banner');
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
            <ImageIcon className="w-7 h-7 text-amber-600" />
            Home Screen Banner Manager
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Upload banner graphics to be rendered on the Flutter mobile app home screen.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-xl gradient-maroon text-white font-bold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-xs text-gray-400 col-span-2 text-center py-12 animate-pulse">
            Loading banners...
          </p>
        ) : banners.length === 0 ? (
          <p className="text-xs text-gray-400 col-span-2 text-center py-12">No active banners found.</p>
        ) : (
          banners.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-3xl border border-amber-100 shadow-festive overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-48 bg-gray-900 overflow-hidden">
                <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end text-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-maroon-950">
                      Order: #{b.displayOrder}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        b.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-white">{b.title}</h3>
                  {b.subtitle && <p className="text-xs text-amber-200/90 font-medium">{b.subtitle}</p>}
                </div>
              </div>

              <div className="p-4 bg-amber-50/30 flex items-center justify-between border-t border-amber-100">
                <div className="text-xs text-gray-500 font-medium flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                  <span>Action: {b.buttonAction || 'None'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(b)}
                    className="p-2 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setBannerToDelete(b);
                      setDeleteDialogOpen(true);
                    }}
                    className="p-2 rounded-lg text-gray-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Banner Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBanner ? 'Edit Banner' : 'Upload New Home Banner'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Banner Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Shree Ganesh Puja 2026"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Subtitle</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Jai Shree Ganesh - Grand Celebration"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Button Text</label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="View Details"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Display Order</label>
              <input
                type="number"
                min="1"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Banner Image File</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-maroon-900"
            />
            {uploadingImage && <p className="text-[10px] text-amber-600 mt-1">Uploading image to Cloudinary...</p>}
          </div>

          {imagePreview && (
            <div className="h-32 w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-900">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            >
              <option value="active">Active (Visible in Flutter App)</option>
              <option value="inactive">Inactive (Hidden)</option>
            </select>
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
              disabled={actionLoading || uploadingImage}
              className="px-6 py-2.5 rounded-xl gradient-maroon text-white font-bold text-xs shadow-md disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : editingBanner ? 'Update Banner' : 'Save Banner'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Banner"
        message={`Are you sure you want to delete banner "${bannerToDelete?.title}"?`}
        loading={actionLoading}
      />
    </div>
  );
}
