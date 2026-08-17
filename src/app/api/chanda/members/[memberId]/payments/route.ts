import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Contribution from '@/models/Contribution';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiForbidden } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';

// GET history for a specific member
export async function GET(req: NextRequest, { params }: { params: { memberId: string } }) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden('Authentication required');

    await connectDB();
    const payments = await Contribution.find({ member: params.memberId })
      .populate('addedBy', 'name')
      .sort({ date: -1 });

    return apiSuccess(payments);
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch payments', null, 500);
  }
}

// POST a new payment (ADMIN ONLY)
export async function POST(req: NextRequest, { params }: { params: { memberId: string } }) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden('Authentication required');
    if (currentUser.role !== 'admin') return apiForbidden('Admin access required');

    const body = await req.json();
    const { amount, paymentMethod, date, note } = body;

    if (!amount || Number(amount) <= 0) return apiError('Amount must be greater than 0');
    if (!paymentMethod) return apiError('Payment method is required');

    await connectDB();

    const memberUser = await User.findById(params.memberId);
    if (!memberUser) return apiError('Member not found');

    const contribution = await Contribution.create({
      member: params.memberId,
      amount: Number(amount),
      paymentMethod,
      date: date ? new Date(date) : new Date(),
      note: note || '',
      addedBy: currentUser._id,
    });

    // Update user's totalChanda cache
    await User.findByIdAndUpdate(params.memberId, { $inc: { totalChanda: Number(amount) } });

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Contribution Added',
      entityType: 'Contribution',
      entityId: contribution._id.toString(),
      description: `${currentUser.name} recorded ₹${amount} contribution for ${memberUser.name}`,
    });

    const populated = await Contribution.findById(contribution._id).populate('addedBy', 'name');

    return apiSuccess(populated, 'Payment recorded successfully', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to record payment', null, 500);
  }
}
