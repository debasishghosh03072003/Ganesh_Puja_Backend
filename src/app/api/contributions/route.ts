import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Contribution from '@/models/Contribution';
import User from '@/models/User';
import Settings from '@/models/Settings';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiForbidden } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');
    const paymentMethod = searchParams.get('paymentMethod');
    const search = searchParams.get('search');

    const query: any = {};
    if (memberId) query.member = memberId;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    let contributions = await Contribution.find(query)
      .populate('member', 'name mobile email profileImage')
      .populate('addedBy', 'name')
      .sort({ date: -1 });

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      contributions = contributions.filter(
        (c: any) =>
          searchRegex.test(c.member?.name || '') ||
          searchRegex.test(c.note || '') ||
          searchRegex.test(c.paymentMethod || '')
      );
    }

    // Summary calculations
    const totalCollected = contributions.reduce((sum, c) => sum + c.amount, 0);
    const settings = (await Settings.findOne()) || { expectedChandaTotal: 130000 };
    const expectedCollection = settings.expectedChandaTotal;
    const pendingAmount = Math.max(0, expectedCollection - totalCollected);

    const membersWithContribution = await Contribution.distinct('member');
    const totalActiveMembers = await User.countDocuments({ status: 'active' });
    const paidMembersCount = membersWithContribution.length;
    const pendingMembersCount = Math.max(0, totalActiveMembers - paidMembersCount);

    return apiSuccess({
      summary: {
        totalCollected,
        expectedCollection,
        pendingAmount,
        paidMembersCount,
        pendingMembersCount,
      },
      contributions,
    });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch contributions', null, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden('Authentication required');

    const body = await req.json();
    const { member, amount, paymentMethod, date, note } = body;

    if (!member) return apiError('Member selection is required');
    if (!amount || Number(amount) <= 0) return apiError('Amount must be greater than 0');
    if (!paymentMethod) return apiError('Payment method is required');

    await connectDB();

    const memberUser = await User.findById(member);
    if (!memberUser) return apiError('Member not found');

    const contribution = await Contribution.create({
      member,
      amount: Number(amount),
      paymentMethod,
      date: date ? new Date(date) : new Date(),
      note: note || '',
      addedBy: currentUser._id,
    });

    // Update user's totalChanda cache
    await User.findByIdAndUpdate(member, { $inc: { totalChanda: Number(amount) } });

    // Activity log
    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Contribution Added',
      entityType: 'Contribution',
      entityId: contribution._id.toString(),
      description: `${currentUser.name} recorded ₹${amount} contribution for ${memberUser.name}`,
    });

    const populated = await Contribution.findById(contribution._id)
      .populate('member', 'name mobile email profileImage')
      .populate('addedBy', 'name');

    return apiSuccess(populated, 'Contribution added successfully', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to add contribution', null, 500);
  }
}
