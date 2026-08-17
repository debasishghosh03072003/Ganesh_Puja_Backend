import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Contribution from '@/models/Contribution';
import OutsideContribution from '@/models/OutsideContribution';
import User from '@/models/User';
import Settings from '@/models/Settings';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiForbidden } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden('Authentication required');

    await connectDB();

    const settings = (await Settings.findOne()) || { expectedChandaPerMember: 10000 };
    const expectedPerMember = settings.expectedChandaPerMember;

    // Get all committee members
    const members = await User.find({ role: { $in: ['admin', 'member'] } });
    const totalMembers = members.length;

    let totalMemberPaid = 0;
    let fullyPaidCount = 0;
    let partiallyPaidCount = 0;
    let pendingCount = 0;

    members.forEach(member => {
      totalMemberPaid += member.totalChanda;
      if (member.totalChanda >= expectedPerMember && expectedPerMember > 0) {
        fullyPaidCount++;
      } else if (member.totalChanda > 0) {
        partiallyPaidCount++;
      } else {
        pendingCount++;
      }
    });

    // Get outside donations
    const outsideContributions = await OutsideContribution.find();
    const totalOutsidePaid = outsideContributions.reduce((sum, c) => sum + c.amount, 0);

    const totalCollected = totalMemberPaid + totalOutsidePaid;

    return apiSuccess({
      totalCollected,
      totalMemberPaid,
      totalOutsidePaid,
      totalMembers,
      fullyPaidCount,
      partiallyPaidCount,
      pendingCount,
      expectedPerMember,
    });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch summary', null, 500);
  }
}
