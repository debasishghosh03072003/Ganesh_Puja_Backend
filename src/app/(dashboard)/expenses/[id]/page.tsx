'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Receipt,
  User,
  Calendar,
  CreditCard,
  Tag,
  ImageIcon,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/expenses/${params.id}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success) {
            setExpense(resData.data);
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
        <div className="h-64 bg-white rounded-3xl border border-gray-100" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-800">Expense Record Not Found</h2>
        <button
          onClick={() => router.push('/expenses')}
          className="mt-4 px-4 py-2 bg-amber-500 text-maroon-950 font-bold rounded-xl text-xs"
        >
          Back to Expenses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      <button
        onClick={() => router.push('/expenses')}
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-maroon-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Expenses List</span>
      </button>

      <div className="bg-white p-8 rounded-3xl border border-amber-100 shadow-festive space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 uppercase">
              {expense.category}
            </span>
            <h1 className="text-3xl font-black text-gray-900 mt-2">{expense.title}</h1>
            <p className="text-xs text-gray-500 mt-1">Recorded on {formatDate(expense.date)}</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-rose-700">-{formatCurrency(expense.amount)}</span>
            <p className="text-xs font-semibold text-gray-500">{expense.paymentMethod}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-maroon-900">
              Payment Information
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Paid By Member:</span>
                <span className="font-bold text-gray-900">{expense.paidBy?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Payment Mode:</span>
                <span className="font-bold text-gray-900">{expense.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Recorded By:</span>
                <span className="font-bold text-gray-900">{expense.createdBy?.name || 'Admin'}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">Description</h3>
            <p className="text-xs text-gray-700 leading-relaxed font-medium">
              {expense.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Receipt Image */}
        {expense.receiptUrl && (
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-600" />
              Attached Receipt / Vendor Bill
            </h3>
            <div className="bg-gray-900 p-4 rounded-2xl flex items-center justify-center">
              <img
                src={expense.receiptUrl}
                alt={expense.title}
                className="max-h-96 object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
