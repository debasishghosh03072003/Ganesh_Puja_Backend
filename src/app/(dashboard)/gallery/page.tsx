'use client';

import React, { useState, useEffect } from 'react';
import {
  Images,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Upload,
  User,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDate } from '@/lib/utils';

const CATEGORIES = [
  'All',
  'Ganesh Idol',
  'Pandal',
  'Decoration',
  'Puja',
  'Aarti',
  'Cultural Program',
  'Committee',
  'Previous Years',
  'Other',
];

export default function GalleryPage() {
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Upload Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Ganesh Idol',
    imageUrl: '',
    imagePublicId: '',
  });

  // Image Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState<any>(null);

  // Confirm Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchGallery = async () => {
    try {
      let url = `/api/gallery?search=${encodeURIComponent(search)}`;
      if (selectedCategory !== 'All') url += `&category=${encodeURIComponent(selectedCategory)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setGallery(data.data.gallery || []);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [search, selectedCategory]);

  const handleOpenAddModal = () => {
    setEditingPhoto(null);
    setImagePreview('');
    setFormData({
      title: '',
      description: '',
      category: 'Ganesh Idol',
      imageUrl: '',
      imagePublicId: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (p: any) => {
    setEditingPhoto(p);
    setImagePreview(p.imageUrl);
    setFormData({
      title: p.title,
      description: p.description || '',
      category: p.category,
      imageUrl: p.imageUrl,
      imagePublicId: p.imagePublicId || '',
    });
    setModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const form = new FormData();
    form.append('file', file);
    form.append('folder', 'ganesh_puja/gallery');

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
      alert('Title and Image File are required');
      return;
    }

    setActionLoading(true);

    try {
      const url = editingPhoto ? `/api/gallery/${editingPhoto._id}` : '/api/gallery';
      const method = editingPhoto ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setActionLoading(false);

      if (data.success) {
        setModalOpen(false);
        fetchGallery();
      } else {
        alert(data.message || 'Failed to save gallery photo');
      }
    } catch (err) {
      console.error(err);
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!photoToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/gallery/${photoToDelete._id}`, { method: 'DELETE' });
      const data = await res.json();
      setActionLoading(false);
      if (data.success) {
        setDeleteDialogOpen(false);
        setPhotoToDelete(null);
        fetchGallery();
      } else {
        alert(data.message || 'Failed to delete photo');
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
            <Images className="w-7 h-7 text-amber-600" />
            Puja Gallery & Media Library
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Cloudinary powered gallery archive for festival photos, idol preparations, and pandal setup.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-xl gradient-maroon text-white font-bold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Upload New Image</span>
        </button>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'gradient-maroon text-white shadow-md'
                  : 'bg-white text-gray-600 border border-amber-100 hover:bg-amber-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="bg-white p-3 rounded-2xl border border-amber-100/80 shadow-sm">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search photo by title or description..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Gallery Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {loading ? (
          <p className="text-xs text-gray-400 col-span-full text-center py-12 animate-pulse">
            Loading photo gallery...
          </p>
        ) : gallery.length === 0 ? (
          <p className="text-xs text-gray-400 col-span-full text-center py-12">
            No gallery photos found in this category.
          </p>
        ) : (
          gallery.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-3xl border border-amber-100 shadow-festive overflow-hidden group hover:shadow-festive-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div
                className="relative h-48 bg-gray-900 overflow-hidden cursor-pointer"
                onClick={() => {
                  setActivePhoto(p);
                  setPreviewModalOpen(true);
                }}
              >
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-maroon-950 shadow-sm">
                    {p.category}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{p.title}</h3>
                  {p.description && <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{p.description}</p>}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">{formatDate(p.createdAt)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setPhotoToDelete(p);
                        setDeleteDialogOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPhoto ? 'Edit Photo Details' : 'Upload Gallery Photo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Photo Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Eco-Friendly Clay Ganesha Idol"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            >
              {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Image File</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-maroon-900"
            />
            {uploadingImage && <p className="text-[10px] text-amber-600 mt-1">Uploading image to Cloudinary...</p>}
          </div>

          {imagePreview && (
            <div className="h-40 w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-900">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Photo description, location, artisan details..."
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
              disabled={actionLoading || uploadingImage}
              className="px-6 py-2.5 rounded-xl gradient-maroon text-white font-bold text-xs shadow-md disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : editingPhoto ? 'Update Details' : 'Upload Image'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Lightbox Preview Modal */}
      <Modal isOpen={previewModalOpen} onClose={() => setPreviewModalOpen(false)} title={activePhoto?.title || 'Preview'}>
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center p-2">
            <img src={activePhoto?.imageUrl} alt={activePhoto?.title} className="max-h-[70vh] object-contain rounded-xl" />
          </div>
          {activePhoto?.description && <p className="text-xs text-gray-700 leading-relaxed font-medium">{activePhoto.description}</p>}
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Photo"
        message={`Are you sure you want to delete "${photoToDelete?.title}" from the gallery archive?`}
        loading={actionLoading}
      />
    </div>
  );
}
