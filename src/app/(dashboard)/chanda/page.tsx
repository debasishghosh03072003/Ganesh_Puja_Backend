'use client';

import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  Filter,
  Calendar,
  User,
  CreditCard,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ChandaPage() {
  const [summary, setSummary] = useState<any>({});
  const [contributions, setContributions] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContrib, setEditingContrib] = useState<any>(null);
  const [formData, setFormData] = useState({
    member: '',
    amount: '',
    paymentMethod: 'UPI',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  // Confirm Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contribToDelete, setContribToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchContributions = async () => {
    try {
      let url = `/api/contributions?search=${encodeURIComponent(search)}`;
      if (selectedMethod) url += `&paymentMethod=${selectedMethod}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setContributions(data.data.contributions || []);
        setSummary(data.data.summary || {});
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchMembersList = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (data.success) {
        setMembersList(data.data.members || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContributions();
    fetchMembersList();
  }, [search, selectedMethod]);

  const handleOpenAddModal = () => {
    setEditingContrib(null);
    setFormData({
      member: membersList[0]?._id || '',
      amount: '10000',
      paymentMethod: 'UPI',
      date: new Date().toISOString().split('T')[0],
      note: 'Annual Chanda Contribution 2026',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (c: any) => {
    setEditingContrib(c);
    setFormData({
      member: c.member?._id || c.member,
      amount: c.amount.toString(),
      paymentMethod: c.paymentMethod,
      date: new Date(c.date).toISOString().split('T')[0],
      note: c.note || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.member) {
      alert('Please select a committee member');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    setActionLoading(true);

    try {
      const url = editingContrib ? `/api/contributions/${editingContrib._id}` : '/api/contributions';
      const method = editingContrib ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setActionLoading(false);

      if (data.success) {
        setModalOpen(false);
        fetchContributions();
      } else {
        alert(data.message || 'Failed to save contribution');
      }
    } catch (err) {
      console.error(err);
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!contribToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/contributions/${contribToDelete._id}`, { method: 'DELETE' });
      const data = await res.json();
      setActionLoading(false);
      if (data.success) {
        setDeleteDialogOpen(false);
        setContribToDelete(null);
        fetchContributions();
      } else {
        alert(data.message || 'Failed to delete contribution');
      }
    } catch (err) {
      console.error(err);
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-amber-100 shadow-festive">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <IndianRupee className="w-7 h-7 text-amber-600" />
            Chanda / Contribution Ledger
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track annual contributions collected from all 13 committee members.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-xl gradient-maroon text-white font-bold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Record Contribution</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Collected"
          value={formatCurrency(summary.totalCollected)}
          subtitle="Realized Collections"
          icon={IndianRupee}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-700"
        />
        <StatCard
          title="Expected Collection"
          value={formatCurrency(summary.expectedCollection)}
          subtitle="Target for 13 Members"
          icon={CreditCard}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-700"
        />
        <StatCard
          title="Pending Amount"
          value={formatCurrency(summary.pendingAmount)}
          subtitle="Remaining to be collected"
          icon={Clock}
          iconBgColor="bg-rose-100"
          iconColor="text-rose-700"
          trendType="negative"
        />
        <StatCard
          title="Paid vs Pending"
          value={`${summary.paidMembersCount || 0} Paid / ${summary.pendingMembersCount || 0} Pending`}
          subtitle="Member Status Ratio"
          icon={CheckCircle2}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-700"
        />
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-amber-100/80 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contribution by member name or note..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Contributions Table */}
      <div className="bg-white rounded-3xl border border-amber-100 shadow-festive overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-amber-50/60 border-b border-amber-100 text-[11px] font-extrabold uppercase tracking-wider text-maroon-900">
                <th className="py-4 px-6">Member</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6">Payment Method</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Note</th>
                <th className="py-4 px-6">Recorded By</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 animate-pulse">
                    Loading contributions...
                  </td>
                </tr>
              ) : contributions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No contribution records found.
                  </td>
                </tr>
              ) : (
                contributions.map((c) => (
                  <tr key={c._id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-200 text-maroon-900 font-bold flex items-center justify-center overflow-hidden">
                          {c.member?.profileImage ? (
                            <img src={c.member.profileImage} alt={c.member?.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{c.member?.name?.charAt(0) || 'M'}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{c.member?.name}</p>
                          <p className="text-[10px] text-gray-400">{c.member?.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-emerald-700 text-sm">
                      {formatCurrency(c.amount)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        {c.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">{formatDate(c.date)}</td>
                    <td className="py-4 px-6 text-gray-500 max-w-[200px] truncate">{c.note || '-'}</td>
                    <td className="py-4 px-6 text-gray-400 text-[11px]">{c.addedBy?.name || 'Admin'}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="p-2 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setContribToDelete(c);
                            setDeleteDialogOpen(true);
                          }}
                          className="p-2 rounded-lg text-gray-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
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

      {/* Record / Edit Contribution Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingContrib ? 'Edit Contribution Record' : 'Record Chanda Contribution'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Member</label>
            <select
              required
              value={formData.member}
              onChange={(e) => setFormData({ ...formData, member: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            >
              <option value="">-- Choose Member --</option>
              {membersList.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.mobile})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amount (₹)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g. 10000"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Note / Reference</label>
            <input
              type="text"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="e.g. GPay UTR #99182, 1st installment"
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
              {actionLoading ? 'Saving...' : editingContrib ? 'Update Contribution' : 'Save Contribution'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Contribution Record"
        message="Are you sure you want to delete this contribution entry? Total chanda collected for this member will automatically adjust."
        loading={actionLoading}
      />
    </div>
  );
}
