'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  Tag,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

  const fetchTransactions = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/api/transactions?page=${page}&limit=20&search=${encodeURIComponent(search)}`;
      if (selectedType) url += `&type=${selectedType}`;
      if (selectedMethod) url += `&paymentMethod=${selectedMethod}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data.transactions || []);
        setPagination(data.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, [search, selectedType, selectedMethod]);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-festive flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ArrowLeftRight className="w-7 h-7 text-amber-600" />
            Unified Transaction Ledger
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Complete financial audit trail combining all Chanda incomes and Vendor expenses.
          </p>
        </div>
        <div className="bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200 text-right">
          <span className="text-[10px] font-bold uppercase text-amber-800">Total Entries</span>
          <p className="text-xl font-black text-maroon-900">{pagination.total}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-amber-100/80 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by description, member name, category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="">All Types (Income & Expense)</option>
            <option value="Contribution">Contributions (Income +)</option>
            <option value="Expense">Expenses (Expense -)</option>
          </select>

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

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-amber-100 shadow-festive overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-amber-50/60 border-b border-amber-100 text-[11px] font-extrabold uppercase tracking-wider text-maroon-900">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Member</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6">Payment Method</th>
                <th className="py-4 px-6 text-right">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 animate-pulse">
                    Loading transactions ledger...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    No transaction entries found.
                  </td>
                </tr>
              ) : (
                transactions.map((t, idx) => {
                  const isContribution = t.type === 'Contribution';
                  return (
                    <tr key={idx} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-4 px-6 text-gray-600 font-medium whitespace-nowrap">
                        {formatDate(t.date)}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            isContribution
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isContribution ? (
                            <ArrowUpRight className="w-3 h-3 text-emerald-700" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-rose-700" />
                          )}
                          {t.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900">
                        {t.member?.name || 'Committee'}
                      </td>
                      <td className="py-4 px-6 text-gray-700 font-medium max-w-xs truncate">
                        {t.description}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-700">
                          {t.category}
                        </span>
                      </td>
                      <td
                        className={`py-4 px-6 text-right font-black text-sm whitespace-nowrap ${
                          isContribution ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isContribution ? `+${formatCurrency(t.amount)}` : formatCurrency(t.amount)}
                      </td>
                      <td className="py-4 px-6 text-gray-600 font-medium">{t.paymentMethod}</td>
                      <td className="py-4 px-6 text-right text-gray-400 text-[11px]">{t.createdBy}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">
            Showing Page <span className="font-bold text-gray-900">{pagination.page}</span> of{' '}
            <span className="font-bold text-gray-900">{pagination.totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchTransactions(pagination.page - 1)}
              className="p-2 rounded-xl border border-gray-200 hover:bg-white text-xs font-bold disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchTransactions(pagination.page + 1)}
              className="p-2 rounded-xl border border-gray-200 hover:bg-white text-xs font-bold disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
