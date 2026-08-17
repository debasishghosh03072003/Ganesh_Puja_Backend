import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Contribution from '@/models/Contribution';
import Expense from '@/models/Expense';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateQuery: any = {};
    if (startDate || endDate) {
      dateQuery.date = {};
      if (startDate) dateQuery.date.$gte = new Date(startDate);
      if (endDate) dateQuery.date.$lte = new Date(endDate);
    }

    const contributions = await Contribution.find(dateQuery);
    const expenses = await Expense.find(dateQuery);

    const totalIncome = contributions.reduce((sum, c) => sum + c.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netBalance = totalIncome - totalExpense;

    // Payment method breakdown
    const paymentMethods: Record<string, { income: number; expense: number }> = {
      Cash: { income: 0, expense: 0 },
      UPI: { income: 0, expense: 0 },
      'Bank Transfer': { income: 0, expense: 0 },
      Other: { income: 0, expense: 0 },
    };

    contributions.forEach((c) => {
      const pm = c.paymentMethod || 'Cash';
      if (!paymentMethods[pm]) paymentMethods[pm] = { income: 0, expense: 0 };
      paymentMethods[pm].income += c.amount;
    });

    expenses.forEach((e) => {
      const pm = e.paymentMethod || 'Cash';
      if (!paymentMethods[pm]) paymentMethods[pm] = { income: 0, expense: 0 };
      paymentMethods[pm].expense += e.amount;
    });

    return apiSuccess({
      summary: {
        totalIncome,
        totalExpense,
        netBalance,
      },
      paymentMethods,
      count: {
        contributionsCount: contributions.length,
        expensesCount: expenses.length,
      },
    });
  } catch (error: any) {
    return apiError(error.message || 'Failed to generate financial report', null, 500);
  }
}
