import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Contribution from '@/models/Contribution';
import Expense from '@/models/Expense';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const type = searchParams.get('type'); // 'Contribution', 'Expense', or null/all
    const memberId = searchParams.get('memberId');
    const category = searchParams.get('category');
    const paymentMethod = searchParams.get('paymentMethod');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    let transactions: any[] = [];

    // Fetch Contributions if applicable
    if (!type || type === 'Contribution') {
      const contribQuery: any = {};
      if (memberId) contribQuery.member = memberId;
      if (paymentMethod) contribQuery.paymentMethod = paymentMethod;

      const contribs = await Contribution.find(contribQuery)
        .populate('member', 'name email mobile profileImage')
        .populate('addedBy', 'name')
        .lean();

      contribs.forEach((c: any) => {
        transactions.push({
          id: c._id.toString(),
          type: 'Contribution',
          date: c.date,
          member: c.member,
          description: c.note || 'Chanda Contribution',
          category: 'Chanda',
          amount: c.amount, // Positive
          paymentMethod: c.paymentMethod,
          createdBy: c.addedBy?.name || 'Admin',
          createdAt: c.createdAt,
        });
      });
    }

    // Fetch Expenses if applicable
    if (!type || type === 'Expense') {
      const expenseQuery: any = {};
      if (memberId) expenseQuery.paidBy = memberId;
      if (category) expenseQuery.category = category;
      if (paymentMethod) expenseQuery.paymentMethod = paymentMethod;

      const exps = await Expense.find(expenseQuery)
        .populate('paidBy', 'name email mobile profileImage')
        .populate('createdBy', 'name')
        .lean();

      exps.forEach((e: any) => {
        transactions.push({
          id: e._id.toString(),
          type: 'Expense',
          date: e.date,
          member: e.paidBy,
          description: e.title + (e.description ? ` (${e.description})` : ''),
          category: e.category,
          amount: -e.amount, // Negative for expenses display
          rawAmount: e.amount,
          paymentMethod: e.paymentMethod,
          receiptUrl: e.receiptUrl,
          createdBy: e.createdBy?.name || 'Admin',
          createdAt: e.createdAt,
        });
      });
    }

    // Sort by date descending
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply Search Filter
    if (search) {
      const s = search.toLowerCase();
      transactions = transactions.filter(
        (t) =>
          t.description?.toLowerCase().includes(s) ||
          t.category?.toLowerCase().includes(s) ||
          t.member?.name?.toLowerCase().includes(s) ||
          t.paymentMethod?.toLowerCase().includes(s)
      );
    }

    const totalCount = transactions.length;
    const startIndex = (page - 1) * limit;
    const paginated = transactions.slice(startIndex, startIndex + limit);

    return apiSuccess({
      transactions: paginated,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch transactions', null, 500);
  }
}
