'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  Upload,
  User,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [totalExpenseAmount, setTotalExpenseAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPaidBy, setSelectedPaidBy] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Decoration',
    paidBy: '',
    paymentMethod: 'Cash',
    description: '',
    date: new Date().toISOString().split('T')[0],
    receiptUrl: '',
    receiptPublicId: '',
  });

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceiptUrl, setActiveReceiptUrl] = useState('');

  // Confirm Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchExpenses = async () => {
    try {
      let url = `/api/expenses?search=${encodeURIComponent(search)}`;
      if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedPaidBy) url += `&paidBy=${selectedPaidBy}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setExpenses(data.data.expenses || []);
        setTotalExpenseAmount(data.data.summary?.totalExpenseAmount || 0);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (data.success) setMembersList(data.data.members || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
    fetchMembers();
  }, [search, selectedCategory, selectedPaidBy]);

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setReceiptPreview('');
    setFormData({
      title: '',
      amount: '',
      category: categories[0]?.name || 'Decoration',
      paidBy: membersList[0]?._id || '',
      paymentMethod: 'Cash',
      description: '',
      date: new Date().toISOString().split('T')[0],
      receiptUrl: '',
      receiptPublicId: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (e: any) => {
    setEditingExpense(e);
    setReceiptPreview(e.receiptUrl || '');
    setFormData({
      title: e.title,
      amount: e.amount.toString(),
      category: e.category,
      paidBy: e.paidBy?._id || e.paidBy,
      paymentMethod: e.paymentMethod,
      description: e.description || '',
      date: new Date(e.date).toISOString().split('T')[0],
      receiptUrl: e.receiptUrl || '',
      receiptPublicId: e.receiptPublicId || '',
    });
    setModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingReceipt(true);
    const form = new FormData();
    form.append('file', file);
    form.append('folder', 'ganesh_puja/receipts');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      setUploadingReceipt(false);

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          receiptUrl: data.data.url,
          receiptPublicId: data.data.publicId,
        }));
        setReceiptPreview(data.data.url);
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      setUploadingReceipt(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return alert('Please enter expense title');
    if (!formData.amount || Number(formData.amount) <= 0) return alert('Amount must be greater than 0');
    if (!formData.paidBy) return alert('Please select WHO paid the expense');

    setActionLoading(true);

    try {
      const url = editingExpense ? `/api/expenses/${editingExpense._id}` : '/api/expenses';
      const method = editingExpense ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setActionLoading(false);

      if (data.success) {
        setModalOpen(false);
        fetchExpenses();
      } else {
        alert(data.message || 'Failed to save expense');
      }
    } catch (err) {
      console.error(err);
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!expenseToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/expenses/${expenseToDelete._id}`, { method: 'DELETE' });
      const data = await res.json();
      setActionLoading(false);
      if (data.success) {
        setDeleteDialogOpen(false);
        setExpenseToDelete(null);
        fetchExpenses();
      } else {
        alert(data.message || 'Failed to delete expense');
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900">Expense Management</h1>
            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black">
              Total: {formatCurrency(totalExpenseAmount)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Log vendor invoices, pandal bills, and track out-of-pocket payments per committee member.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-xl gradient-maroon text-white font-bold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-amber-100/80 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expense by title, category, description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPaidBy}
            onChange={(e) => setSelectedPaidBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="">All Paid By Members</option>
            {membersList.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense List Table */}
      <div className="bg-white rounded-3xl border border-amber-100 shadow-festive overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-amber-50/60 border-b border-amber-100 text-[11px] font-extrabold uppercase tracking-wider text-maroon-900">
                <th className="py-4 px-6">Expense Title</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6">Paid By</th>
                <th className="py-4 px-6">Payment Method</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-center">Receipt</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 animate-pulse">
                    Loading expense records...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e._id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{e.title}</p>
                        {e.description && <p className="text-[10px] text-gray-400 truncate max-w-xs">{e.description}</p>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-maroon-900 border border-amber-200">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-rose-700 text-sm">
                      -{formatCurrency(e.amount)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-semibold text-gray-800">{e.paidBy?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">{e.paymentMethod}</td>
                    <td className="py-4 px-6 text-gray-500 font-medium">{formatDate(e.date)}</td>
                    <td className="py-4 px-6 text-center">
                      {e.receiptUrl ? (
                        <button
                          onClick={() => {
                            setActiveReceiptUrl(e.receiptUrl);
                            setReceiptModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
                        >
                          <ImageIcon className="w-3 h-3" />
                          View Receipt
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-300">No bill</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/expenses/${e._id}`}
                          className="p-2 rounded-lg text-gray-600 hover:text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(e)}
                          className="p-2 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setExpenseToDelete(e);
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

      {/* Record / Edit Expense Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Expense Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Kumartuli Idol Advance Payment"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
            />
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
                placeholder="500"
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
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Paid By (Committee Member)
              </label>
              <select
                required
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Choose Member --</option>
                {membersList.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
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

          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Receipt/Bill Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-maroon-900"
              />
              {uploadingReceipt && <p className="text-[10px] text-amber-600 mt-1">Uploading file to Cloudinary...</p>}
            </div>
          </div>

          {receiptPreview && (
            <div className="p-2 border border-gray-200 rounded-xl bg-gray-50 flex items-center gap-3">
              <img src={receiptPreview} alt="Receipt preview" className="w-12 h-12 object-cover rounded-lg" />
              <span className="text-xs text-emerald-700 font-bold">Receipt image attached</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Vendor details, bill number, description..."
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
              disabled={actionLoading || uploadingReceipt}
              className="px-6 py-2.5 rounded-xl gradient-maroon text-white font-bold text-xs shadow-md disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : editingExpense ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Receipt Image Viewer Modal */}
      <Modal isOpen={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} title="Receipt Preview">
        <div className="p-2 flex items-center justify-center bg-gray-900 rounded-2xl overflow-hidden">
          <img src={activeReceiptUrl} alt="Bill receipt" className="max-h-[70vh] object-contain rounded-xl" />
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Expense Entry"
        message={`Are you sure you want to delete "${expenseToDelete?.title}"?`}
        loading={actionLoading}
      />
    </div>
  );
}
