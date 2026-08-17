import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Contribution from '@/models/Contribution';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiNotFound, apiForbidden } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden();

    const body = await req.json();
    const { amount, paymentMethod, date, note } = body;

    await connectDB();
    const contribution = await Contribution.findById(params.id);
    if (!contribution) return apiNotFound('Contribution record not found');

    const oldAmount = contribution.amount;

    if (amount !== undefined && Number(amount) > 0) {
      const diff = Number(amount) - oldAmount;
      contribution.amount = Number(amount);
      await User.findByIdAndUpdate(contribution.member, { $inc: { totalChanda: diff } });
    }

    if (paymentMethod) contribution.paymentMethod = paymentMethod;
    if (date) contribution.date = new Date(date);
    if (note !== undefined) contribution.note = note;

    await contribution.save();

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Contribution Updated',
      entityType: 'Contribution',
      entityId: contribution._id.toString(),
      description: `${currentUser.name} updated contribution record #${params.id}`,
    });

    const updated = await Contribution.findById(params.id)
      .populate('member', 'name mobile email profileImage')
      .populate('addedBy', 'name');

    return apiSuccess(updated, 'Contribution updated successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to update contribution', null, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return apiForbidden('Only Admin can delete contributions');
    }

    await connectDB();
    const contribution = await Contribution.findById(params.id);
    if (!contribution) return apiNotFound('Contribution record not found');

    // Deduct totalChanda from member
    await User.findByIdAndUpdate(contribution.member, { $inc: { totalChanda: -contribution.amount } });
    await Contribution.findByIdAndDelete(params.id);

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Contribution Deleted',
      entityType: 'Contribution',
      entityId: params.id,
      description: `${currentUser.name} deleted contribution of ₹${contribution.amount}`,
    });

    return apiSuccess(null, 'Contribution deleted successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to delete contribution', null, 500);
  }
}
