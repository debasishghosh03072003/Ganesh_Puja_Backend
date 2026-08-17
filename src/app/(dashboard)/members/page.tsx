'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Shield,
  Eye,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  IndianRupee,
  Receipt,
  UserCheck,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [targetCount, setTargetCount] = useState(13);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add/Edit Member Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    role: 'member',
    status: 'active',
    profileImage: '',
  });

  // Confirm Delete Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/members?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setMembers(data.data.members || []);
        setActiveCount(data.data.totalActiveMembers || 0);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search]);

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      password: '',
      role: 'member',
      status: 'active',
      profileImage: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (m: any) => {
    setEditingMember(m);
    setFormData({
      name: m.name,
      mobile: m.mobile,
      email: m.email,
      password: '', // blank password on edit
      role: m.role,
      status: m.status,
      profileImage: m.profileImage || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const url = editingMember ? `/api/members/${editingMember._id}` : '/api/members';
      const method = editingMember ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setActionLoading(false);

      if (data.success) {
        setModalOpen(false);
        fetchMembers();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/members/${memberToDelete._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      setActionLoading(false);
      if (data.success) {
        setDeleteDialogOpen(false);
        setMemberToDelete(null);
        fetchMembers();
      } else {
        alert(data.message || 'Failed to delete member');
      }
    } catch (err) {
      console.error(err);
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header & Prominent Member Count */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-amber-100 shadow-festive">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-maroon text-amber-300 flex items-center justify-center font-bold text-2xl shadow-lg">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900">Committee Directory</h1>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-maroon-900 text-xs font-black border border-amber-200">
                Target: {targetCount} Members
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Currently Managing <span className="font-bold text-maroon-800">{activeCount} / 13</span> Active Committee Members
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-xl gradient-maroon text-white font-bold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-amber-100/80 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member by name, mobile or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-3xl border border-amber-100 shadow-festive overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-amber-50/60 border-b border-amber-100 text-[11px] font-extrabold uppercase tracking-wider text-maroon-900">
                <th className="py-4 px-6">Member</th>
                <th className="py-4 px-6">Contact Info</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6 text-right">Total Chanda</th>
                <th className="py-4 px-6 text-right">Total Expense</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 animate-pulse">
                    Loading committee members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No committee members found.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m._id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-200 text-maroon-800 font-bold flex items-center justify-center overflow-hidden border border-amber-300">
                          {m.profileImage ? (
                            <img src={m.profileImage} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{m.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{m.name}</p>
                          <p className="text-[10px] text-gray-400">Joined {formatDate(m.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                        <Phone className="w-3.5 h-3.5 text-amber-600" />
                        <span>{m.mobile}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>{m.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          m.role === 'admin'
                            ? 'bg-maroon-100 text-maroon-900 border border-maroon-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {m.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-emerald-700">
                      {formatCurrency(m.totalChanda)}
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-rose-700">
                      {formatCurrency(m.totalExpense)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          m.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {m.status === 'active' ? (
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-600" />
                        )}
                        {m.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/members/${m._id}`}
                          className="p-2 rounded-lg text-gray-600 hover:text-amber-700 hover:bg-amber-100 transition-colors"
                          title="View Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(m)}
                          className="p-2 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          title="Edit Member"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setMemberToDelete(m);
                            setDeleteDialogOpen(true);
                          }}
                          className="p-2 rounded-lg text-gray-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMember ? 'Edit Committee Member' : 'Add Committee Member'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Debasish Ghosh"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mobile Number</label>
              <input
                type="text"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="9876543210"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="member@ganeshpuja.org"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Password {editingMember && '(Leave blank to keep unchanged)'}
            </label>
            <input
              type="password"
              required={!editingMember}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter account password"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Profile Photo URL</label>
            <input
              type="text"
              value={formData.profileImage}
              onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
              placeholder="https://..."
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
              {actionLoading ? 'Saving...' : editingMember ? 'Update Member' : 'Create Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Committee Member"
        message={`Are you sure you want to remove ${memberToDelete?.name} from the committee directory? This will remove access to the admin system.`}
        loading={actionLoading}
      />
    </div>
  );
}
