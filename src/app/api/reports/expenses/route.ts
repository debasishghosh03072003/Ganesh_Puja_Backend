import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Expense from '@/models/Expense';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const categoryAgg = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const totalExpense = categoryAgg.reduce((sum, item) => sum + item.totalAmount, 0);

    const categoriesWithPercentage = categoryAgg.map((item) => ({
      category: item._id,
      totalAmount: item.totalAmount,
      count: item.count,
      percentage: totalExpense > 0 ? ((item.totalAmount / totalExpense) * 100).toFixed(1) : '0',
    }));

    return apiSuccess({
      totalExpense,
      categories: categoriesWithPercentage,
    });
  } catch (error: any) {
    return apiError(error.message || 'Failed to generate category expense report', null, 500);
  }
}
