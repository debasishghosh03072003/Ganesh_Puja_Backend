export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Contribution from '@/models/Contribution';
import Expense from '@/models/Expense';
import Activity from '@/models/Activity';
import Settings from '@/models/Settings';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // 1. Total Members
    const totalMembersCount = await User.countDocuments({ status: 'active' });

    // 2. Contributions aggregate
    const contributionsAgg = await Contribution.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalChanda = 0;
    let cashContributions = 0;
    let upiBankContributions = 0;

    contributionsAgg.forEach((item) => {
      totalChanda += item.total;
      if (item._id === 'Cash') {
        cashContributions += item.total;
      } else {
        upiBankContributions += item.total;
      }
    });

    // 3. Expenses aggregate
    const expensesAgg = await Expense.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalExpenses = 0;
    let cashExpenses = 0;
    let upiBankExpenses = 0;

    expensesAgg.forEach((item) => {
      totalExpenses += item.total;
      if (item._id === 'Cash') {
        cashExpenses += item.total;
      } else {
        upiBankExpenses += item.total;
      }
    });

    // Financial formulas
    const currentBalance = totalChanda - totalExpenses;
    const cashBalance = cashContributions - cashExpenses;
    const upiBankBalance = upiBankContributions - upiBankExpenses;

    // Member Payment Status
    const membersWithContributions = await Contribution.distinct('member');
    const paidMembersCount = membersWithContributions.length;
    const pendingMembersCount = Math.max(0, totalMembersCount - paidMembersCount);

    // Expense Category Distribution
    const categoryDistributionAgg = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' },
        },
      },
      { $project: { name: '$_id', value: 1, _id: 0 } },
      { $sort: { value: -1 } },
    ]);

    // Monthly breakdown (Income vs Expense)
    const incomeMonthly = await Contribution.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const expenseMonthly = await Expense.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Merge monthly charts
    const monthlyMap: Record<string, { month: string; income: number; expense: number }> = {};

    incomeMonthly.forEach((item) => {
      monthlyMap[item._id] = { month: item._id, income: item.amount, expense: 0 };
    });

    expenseMonthly.forEach((item) => {
      if (!monthlyMap[item._id]) {
        monthlyMap[item._id] = { month: item._id, income: 0, expense: item.amount };
      } else {
        monthlyMap[item._id].expense = item.amount;
      }
    });

    const monthlyChartData = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    // Recent Contributions
    const recentContributions = await Contribution.find()
      .populate('member', 'name profileImage')
      .sort({ date: -1 })
      .limit(5);

    // Recent Expenses
    const recentExpenses = await Expense.find()
      .populate('paidBy', 'name profileImage')
      .sort({ date: -1 })
      .limit(5);

    // Recent Activities
    const recentActivities = await Activity.find()
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(6);

    // Settings
    const settings = await Settings.findOne() || { expectedChandaTotal: 130000 };

    return apiSuccess({
      summary: {
        totalChanda,
        totalExpenses,
        currentBalance,
        totalMembers: totalMembersCount,
        paidMembers: paidMembersCount,
        pendingMembers: pendingMembersCount,
        cashBalance,
        upiBankBalance,
        expectedChanda: settings.expectedChandaTotal,
        pendingAmount: Math.max(0, settings.expectedChandaTotal - totalChanda),
      },
      charts: {
        incomeVsExpense: monthlyChartData,
        categoryDistribution: categoryDistributionAgg,
      },
      recentContributions,
      recentExpenses,
      recentActivities,
    });
  } catch (error: any) {
    console.error('Dashboard API Error:', error);
    return apiError(error.message || 'Failed to fetch dashboard data', null, 500);
  }
}

