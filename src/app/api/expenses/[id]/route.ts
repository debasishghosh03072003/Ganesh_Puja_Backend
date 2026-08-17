import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Expense from '@/models/Expense';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiNotFound, apiForbidden } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const expense = await Expense.findById(params.id)
      .populate('paidBy', 'name mobile email profileImage')
      .populate('createdBy', 'name');

    if (!expense) return apiNotFound('Expense not found');
    return apiSuccess(expense);
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch expense details', null, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden();

    const body = await req.json();
    const {
      title,
      amount,

      paidBy,
      paymentMethod,
      description,
      date,
      receiptUrl,
      receiptPublicId,
    } = body;

    await connectDB();
    const expense = await Expense.findById(params.id);
    if (!expense) return apiNotFound('Expense not found');

    const oldAmount = expense.amount;
    const oldPaidBy = expense.paidBy.toString();

    if (amount !== undefined && Number(amount) > 0) {
      const newAmt = Number(amount);
      const targetPayer = paidBy || oldPaidBy;

      if (targetPayer === oldPaidBy) {
        const diff = newAmt - oldAmount;
        await User.findByIdAndUpdate(oldPaidBy, { $inc: { totalExpense: diff } });
      } else {
        // Transfer expense cache between members
        await User.findByIdAndUpdate(oldPaidBy, { $inc: { totalExpense: -oldAmount } });
        await User.findByIdAndUpdate(targetPayer, { $inc: { totalExpense: newAmt } });
      }

      expense.amount = newAmt;
    }

    if (title) expense.title = title;

    if (paidBy) expense.paidBy = paidBy;
    if (paymentMethod) expense.paymentMethod = paymentMethod;
    if (description !== undefined) expense.description = description;
    if (date) expense.date = new Date(date);
    if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl;
    if (receiptPublicId !== undefined) expense.receiptPublicId = receiptPublicId;

    await expense.save();

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Expense Updated',
      entityType: 'Expense',
      entityId: expense._id.toString(),
      description: `${currentUser.name} updated expense: ${expense.title}`,
    });

    const updated = await Expense.findById(params.id)
      .populate('paidBy', 'name mobile email profileImage')
      .populate('createdBy', 'name');

    return apiSuccess(updated, 'Expense updated successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to update expense', null, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return apiForbidden('Only Admin can delete expenses');
    }

    await connectDB();
    const expense = await Expense.findById(params.id);
    if (!expense) return apiNotFound('Expense not found');

    await User.findByIdAndUpdate(expense.paidBy, { $inc: { totalExpense: -expense.amount } });
    await Expense.findByIdAndDelete(params.id);

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Expense Deleted',
      entityType: 'Expense',
      entityId: params.id,
      description: `${currentUser.name} deleted expense: ${expense.title} (₹${expense.amount})`,
    });

    return apiSuccess(null, 'Expense deleted successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to delete expense', null, 500);
  }
}
