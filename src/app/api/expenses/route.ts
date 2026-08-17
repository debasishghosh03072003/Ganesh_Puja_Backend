import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Expense from '@/models/Expense';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiForbidden } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';

// Helper to get current IST date bounds
function getISTDateBounds() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // +05:30 IST
  const istTime = new Date(now.getTime() + istOffset);
  
  // start of today in IST
  const startOfTodayIST = new Date(Date.UTC(istTime.getUTCFullYear(), istTime.getUTCMonth(), istTime.getUTCDate()));
  const startOfTodayUTC = new Date(startOfTodayIST.getTime() - istOffset);

  // start of month in IST
  const startOfMonthIST = new Date(Date.UTC(istTime.getUTCFullYear(), istTime.getUTCMonth(), 1));
  const startOfMonthUTC = new Date(startOfMonthIST.getTime() - istOffset);

  return { startOfTodayUTC, startOfMonthUTC };
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const paidBy = searchParams.get('paidBy');
    const paymentMethod = searchParams.get('paymentMethod');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = {};
    if (paidBy) query.paidBy = paidBy;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    let expenses = await Expense.find(query)
      .populate('paidBy', 'name mobile email profileImage')
      .populate('createdBy', 'name')
      .sort({ date: -1 });

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      expenses = expenses.filter(
        (e: any) =>
          searchRegex.test(e.title || '') ||
          searchRegex.test(e.paidBy?.name || '') ||
          searchRegex.test(e.description || '')
      );
    }

    const allExpenses = await Expense.find();
    const totalExpenseAmount = allExpenses.reduce((sum, e) => sum + e.amount, 0);

    const { startOfTodayUTC, startOfMonthUTC } = getISTDateBounds();

    const todayExpenseAmount = allExpenses
      .filter((e) => new Date(e.date) >= startOfTodayUTC)
      .reduce((sum, e) => sum + e.amount, 0);

    const thisMonthExpenseAmount = allExpenses
      .filter((e) => new Date(e.date) >= startOfMonthUTC)
      .reduce((sum, e) => sum + e.amount, 0);

    return apiSuccess({
      summary: {
        totalExpenseAmount,
        count: allExpenses.length,
        todayExpenseAmount,
        thisMonthExpenseAmount,
      },
      expenses,
    });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch expenses', null, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden('Authentication required');

    const body = await req.json();
    let {
      title,
      amount,
      paidBy,
      paymentMethod,
      description,
      date,
      receiptUrl,
      receiptPublicId,
    } = body;

    // RBAC: Normal member can only create expenses for themselves
    if (currentUser.role !== 'admin') {
      paidBy = currentUser._id.toString();
    }

    if (!title) return apiError('Expense title is required');
    if (!amount || Number(amount) <= 0) return apiError('Amount must be greater than 0');
    if (!paidBy) return apiError('Paid By member is required');

    await connectDB();

    const payer = await User.findById(paidBy);
    if (!payer) return apiError('Selected Paid By member not found');

    const expense = await Expense.create({
      title,
      amount: Number(amount),
      paidBy,
      paymentMethod: paymentMethod || 'Cash',
      description: description || '',
      date: date ? new Date(date) : new Date(),
      receiptUrl: receiptUrl || '',
      receiptPublicId: receiptPublicId || '',
      createdBy: currentUser._id,
    });

    // Update user's totalExpense
    await User.findByIdAndUpdate(paidBy, { $inc: { totalExpense: Number(amount) } });

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Expense Added',
      entityType: 'Expense',
      entityId: expense._id.toString(),
      description: `${currentUser.name} recorded ₹${amount} expense for ${title} (Paid by ${payer.name})`,
    });

    const populated = await Expense.findById(expense._id)
      .populate('paidBy', 'name mobile email profileImage')
      .populate('createdBy', 'name');

    return apiSuccess(populated, 'Expense recorded successfully', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to add expense', null, 500);
  }
}
