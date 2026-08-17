'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Mail,
  Shield,
  IndianRupee,
  Receipt,
  Wallet,
  Calendar,
  CheckCircle,
  Activity as ActivityIcon,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatCard } from '@/components/ui/StatCard';

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/members/${params.id}`)
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
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded-xl" />
        <div className="h-44 bg-white rounded-3xl border border-gray-100" />
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-800">Member Not Found</h2>
        <button
          onClick={() => router.push('/members')}
          className="mt-4 px-4 py-2 bg-amber-500 text-maroon-950 font-bold rounded-xl text-xs"
        >
          Back to Members List
        </button>
      </div>
    );
  }

  const { user, stats, contributions, expenses, activities } = data;

  return (
    <div className="space-y-8 pb-10">
      {/* Back Button */}
      <button
        onClick={() => router.push('/members')}
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-maroon-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Committee Directory</span>
      </button>

      {/* Member Profile Card Header */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-amber-100 shadow-festive flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-amber-200 text-maroon-900 font-extrabold text-3xl flex items-center justify-center border-4 border-amber-300 shadow-md overflow-hidden flex-shrink-0">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-gray-900">{user.name}</h1>
              <span
                className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  user.role === 'admin' ? 'bg-maroon-100 text-maroon-900' : 'bg-amber-100 text-amber-900'
                }`}
              >
                {user.role}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-600 font-medium">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-600" />
                <span>{user.mobile}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Member since {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-amber-50/60 p-3 rounded-2xl border border-amber-100">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-bold text-gray-800">Status: {user.status.toUpperCase()}</span>
        </div>
      </div>

      {/* Member Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Contributions (Chanda)"
          value={formatCurrency(stats.totalContribution)}
          subtitle={`${contributions?.length || 0} Transactions`}
          icon={IndianRupee}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-700"
        />
        <StatCard
          title="Total Expenses Paid"
          value={formatCurrency(stats.totalExpense)}
          subtitle={`${expenses?.length || 0} Vendor Payments`}
          icon={Receipt}
          iconBgColor="bg-rose-100"
          iconColor="text-rose-700"
        />
        <StatCard
          title="Net Financial Balance"
          value={formatCurrency(stats.netContribution)}
          subtitle="Contributions - Expenses"
          icon={Wallet}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-700"
        />
      </div>

      {/* Lists & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contribution History */}
        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-festive">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-amber-600" />
            Chanda Contribution Records
          </h3>
          <div className="space-y-3">
            {contributions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No contributions recorded for this member.</p>
            ) : (
              contributions.map((c: any) => (
                <div
                  key={c._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/40 border border-amber-100/50"
                >
                  <div>
                    <p className="text-xs font-bold text-gray-900">{c.note || 'Chanda Contribution'}</p>
                    <p className="text-[10px] text-gray-500">
                      {c.paymentMethod} • {formatDate(c.date)}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700">{formatCurrency(c.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expenses Paid History */}
        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-festive">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-600" />
            Out-of-Pocket Expenses Paid
          </h3>
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No expenses paid by this member.</p>
            ) : (
              expenses.map((e: any) => (
                <div
                  key={e._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/30 border border-rose-100/50"
                >
                  <div>
                    <p className="text-xs font-bold text-gray-900">{e.title}</p>
                    <p className="text-[10px] text-gray-500">
                      {e.category} • {e.paymentMethod} • {formatDate(e.date)}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-rose-700">-{formatCurrency(e.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
