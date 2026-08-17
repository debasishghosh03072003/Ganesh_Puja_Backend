'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  IndianRupee,
  Receipt,
  Wallet,
  Users,
  PieChart as PieChartIcon,
  Calendar,
  Printer,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'financial' | 'members' | 'categories'>('financial');
  const [financialData, setFinancialData] = useState<any>(null);
  const [memberReports, setMemberReports] = useState<any[]>([]);
  const [expenseReports, setExpenseReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      let finUrl = '/api/reports/financial';
      if (startDate || endDate) finUrl += `?startDate=${startDate}&endDate=${endDate}`;

      const [resFin, resMem, resExp] = await Promise.all([
        fetch(finUrl).then((r) => r.json()),
        fetch('/api/reports/members').then((r) => r.json()),
        fetch('/api/reports/expenses').then((r) => r.json()),
      ]);

      if (resFin.success) setFinancialData(resFin.data);
      if (resMem.success) setMemberReports(resMem.data || []);
      if (resExp.success) setExpenseReports(resExp.data);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return alert('No report data to export');
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) => Object.values(obj).map((v) => `"${v}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-amber-100 shadow-festive">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-amber-600" />
            Financial Audit & Analytics Reports
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Generate detailed audit statements, member contributions summaries, and category expense exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl border border-amber-200 text-maroon-900 font-bold text-xs hover:bg-amber-50 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>

          <button
            onClick={() => {
              if (activeTab === 'members') exportToCSV(memberReports, 'Member_Financial_Report');
              else if (activeTab === 'categories')
                exportToCSV(expenseReports?.categories || [], 'Category_Expense_Report');
              else alert('CSV export available on Members or Category tabs');
            }}
            className="px-5 py-2.5 rounded-xl gradient-maroon text-white font-bold text-xs shadow-md hover:opacity-95 flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs & Date Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-amber-100/80 shadow-sm">
        <div className="flex items-center gap-2 bg-amber-50 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('financial')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'financial'
                ? 'bg-maroon-900 text-amber-200 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overall Financials
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'members'
                ? 'bg-maroon-900 text-amber-200 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Member-wise Breakdown
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'categories'
                ? 'bg-maroon-900 text-amber-200 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Category Distribution
          </button>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
          <Calendar className="w-4 h-4 text-amber-600" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium"
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              title="Total Income (Chanda)"
              value={formatCurrency(financialData?.summary?.totalIncome || 0)}
              subtitle={`${financialData?.count?.contributionsCount || 0} Total Transactions`}
              icon={IndianRupee}
              iconBgColor="bg-emerald-100"
              iconColor="text-emerald-700"
            />
            <StatCard
              title="Total Expenses"
              value={formatCurrency(financialData?.summary?.totalExpense || 0)}
              subtitle={`${financialData?.count?.expensesCount || 0} Total Payments`}
              icon={Receipt}
              iconBgColor="bg-rose-100"
              iconColor="text-rose-700"
            />
            <StatCard
              title="Net Current Balance"
              value={formatCurrency(financialData?.summary?.netBalance || 0)}
              subtitle="Income - Expenses"
              icon={Wallet}
              iconBgColor="bg-purple-100"
              iconColor="text-purple-700"
            />
          </div>

          {/* Payment Methods breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-festive">
            <h3 className="text-base font-bold text-gray-900 mb-4">Payment Method Reconciliation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(financialData?.paymentMethods || {}).map(([method, val]: any) => (
                <div key={method} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                  <span className="text-xs font-extrabold text-maroon-900 uppercase">{method}</span>
                  <div className="mt-3 space-y-1 text-xs">
                    <p className="text-emerald-700 font-bold">Income: {formatCurrency(val.income)}</p>
                    <p className="text-rose-700 font-bold">Expense: {formatCurrency(val.expense)}</p>
                    <p className="text-gray-900 font-black pt-1 border-t border-amber-200">
                      Net: {formatCurrency(val.income - val.expense)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-white rounded-3xl border border-amber-100 shadow-festive overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-50/60 border-b border-amber-100 text-[11px] font-extrabold uppercase tracking-wider text-maroon-900">
                  <th className="py-4 px-6">Member Name</th>
                  <th className="py-4 px-6">Contact</th>
                  <th className="py-4 px-6 text-right">Chanda Contributed</th>
                  <th className="py-4 px-6 text-right">Expenses Paid</th>
                  <th className="py-4 px-6 text-right">Net Financial Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {memberReports.map((m) => (
                  <tr key={m.memberId} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">{m.name}</td>
                    <td className="py-4 px-6 text-gray-500">{m.mobile}</td>
                    <td className="py-4 px-6 text-right font-extrabold text-emerald-700">
                      {formatCurrency(m.totalContribution)}
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-rose-700">
                      {formatCurrency(m.totalExpense)}
                    </td>
                    <td
                      className={`py-4 px-6 text-right font-black ${
                        m.netBalance >= 0 ? 'text-emerald-800' : 'text-rose-800'
                      }`}
                    >
                      {formatCurrency(m.netBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl border border-amber-100 shadow-festive overflow-hidden">
          <div className="p-6 border-b border-amber-100">
            <h3 className="text-base font-bold text-gray-900">Expense Distribution by Category</h3>
            <p className="text-xs text-gray-500">
              Total Category Expenses: {formatCurrency(expenseReports?.totalExpense || 0)}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-50/60 border-b border-amber-100 text-[11px] font-extrabold uppercase tracking-wider text-maroon-900">
                  <th className="py-4 px-6">Category Name</th>
                  <th className="py-4 px-6 text-center">Invoices / Entries</th>
                  <th className="py-4 px-6 text-right">Total Amount</th>
                  <th className="py-4 px-6 text-right">Percentage Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {(expenseReports?.categories || []).map((c: any) => (
                  <tr key={c.category} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">{c.category}</td>
                    <td className="py-4 px-6 text-center font-semibold text-gray-600">{c.count}</td>
                    <td className="py-4 px-6 text-right font-extrabold text-rose-700">
                      {formatCurrency(c.totalAmount)}
                    </td>
                    <td className="py-4 px-6 text-right font-black text-amber-700">{c.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
