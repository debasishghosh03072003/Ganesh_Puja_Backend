'use client';

import React, { useEffect, useState } from 'react';
import {
  IndianRupee,
  Receipt,
  Wallet,
  Users,
  CheckCircle2,
  Clock,
  Landmark,
  Banknote,
  TrendingUp,
  Activity as ActivityIcon,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const CATEGORY_COLORS = [
  '#700A1A',
  '#D97706',
  '#2563EB',
  '#059669',
  '#7C3AED',
  '#DB2777',
  '#EA580C',
  '#4B5563',
];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const recentContributions = data?.recentContributions || [];
  const recentExpenses = data?.recentExpenses || [];
  const recentActivities = data?.recentActivities || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Banner / Welcome Header */}
      <div className="relative gradient-maroon rounded-3xl p-6 md:p-8 text-white shadow-xl overflow-hidden border border-amber-900/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-amber-500/10 backdrop-blur-3xl transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ganesh Puja Festival 2026</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-amber-100">
              Financial Overview & Control Center
            </h1>
            <p className="text-sm text-amber-200/80 mt-1 max-w-xl">
              Real-time calculation of committee chanda collections, vendor expenses, cash reserves, and online bank balances.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[180px]">
            <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Committee Target</p>
            <p className="text-2xl font-black text-white mt-0.5">13 Members</p>
            <p className="text-[11px] text-amber-200/70 mt-1">Expected: {formatCurrency(summary.expectedChanda)}</p>
          </div>
        </div>
      </div>

      {/* Top Summary Cards Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Chanda"
          value={formatCurrency(summary.totalChanda)}
          subtitle={`Target: ${formatCurrency(summary.expectedChanda)}`}
          icon={IndianRupee}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-700"
          trend={`${summary.paidMembers}/13 Paid`}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          subtitle="All Vendor & Puja Payments"
          icon={Receipt}
          iconBgColor="bg-rose-100"
          iconColor="text-rose-700"
          trendType="negative"
        />
        <StatCard
          title="Current Balance"
          value={formatCurrency(summary.currentBalance)}
          subtitle="Net Available Funds"
          icon={Wallet}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-700"
          trend="Income - Expense"
          trendType="positive"
        />
        <StatCard
          title="Committee Members"
          value={`${summary.totalMembers} / 13`}
          subtitle="Active Committee Members"
          icon={Users}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-700"
          trend="Authorized"
        />
      </div>

      {/* Additional Stats Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Paid Members"
          value={`${summary.paidMembers} Members`}
          subtitle="Contributed to Chanda"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-700"
        />
        <StatCard
          title="Pending Members"
          value={`${summary.pendingMembers} Members`}
          subtitle={`Pending: ${formatCurrency(summary.pendingAmount)}`}
          icon={Clock}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-700"
          trendType="negative"
        />
        <StatCard
          title="Cash Balance"
          value={formatCurrency(summary.cashBalance)}
          subtitle="Physical Cash Reserve"
          icon={Banknote}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-700"
        />
        <StatCard
          title="UPI / Bank Balance"
          value={formatCurrency(summary.upiBankBalance)}
          subtitle="Online & Bank Accounts"
          icon={Landmark}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-700"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Income vs Expense Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-amber-100 shadow-festive">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Income vs Expense Growth</h3>
              <p className="text-xs text-gray-500">Monthly breakdown of chanda received vs expenses paid</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Contributions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-maroon-700" />
                <span>Expenses</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.incomeVsExpense || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  formatter={(value: any) => [`₹${value}`, '']}
                />
                <Bar dataKey="income" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#800020" radius={[6, 6, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-festive">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Expense Breakdown</h3>
          <p className="text-xs text-gray-500 mb-4">Category-wise financial distribution</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.categoryDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts.categoryDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`₹${val}`, 'Amount']} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables & Activity Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Contributions */}
        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-festive">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-emerald-600" />
              Recent Contributions
            </h3>
            <span className="text-xs font-bold text-amber-700">Top 5</span>
          </div>
          <div className="space-y-3">
            {recentContributions.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No contribution records found.</p>
            ) : (
              recentContributions.map((c: any) => (
                <div
                  key={c._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/50 border border-amber-100/50 hover:bg-amber-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-200 text-maroon-800 font-bold flex items-center justify-center text-xs">
                      {c.member?.name?.charAt(0) || 'M'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{c.member?.name}</p>
                      <p className="text-[10px] text-gray-500">
                        {c.paymentMethod} • {formatDate(c.date)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700">{formatCurrency(c.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-festive">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ArrowDownRight className="w-5 h-5 text-rose-600" />
              Recent Expenses
            </h3>
            <span className="text-xs font-bold text-maroon-700">Top 5</span>
          </div>
          <div className="space-y-3">
            {recentExpenses.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No expense records found.</p>
            ) : (
              recentExpenses.map((e: any) => (
                <div
                  key={e._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/30 border border-rose-100/50 hover:bg-rose-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-rose-200 text-maroon-900 font-bold flex items-center justify-center text-xs">
                      {e.category?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 truncate max-w-[140px]">{e.title}</p>
                      <p className="text-[10px] text-gray-500">
                        Paid by <span className="font-semibold text-gray-700">{e.paidBy?.name}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-rose-700">-{formatCurrency(e.amount)}</span>
                    <p className="text-[10px] text-gray-400">{formatDate(e.date)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-festive">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ActivityIcon className="w-5 h-5 text-amber-600" />
              Live Activity Stream
            </h3>
          </div>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No activities recorded yet.</p>
            ) : (
              recentActivities.map((act: any) => (
                <div key={act._id} className="flex items-start gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-800 font-medium leading-tight">{act.description}</p>
                    <span className="text-[10px] text-gray-400">{formatDate(act.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
