export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
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
    const expectedPerMember = settings.expectedChandaPerMember || 1000;

    // Return users mapped with required/due calculations
    const users = await User.find({ role: { $in: ['admin', 'member'] } }).sort({ name: 1 });

    const members = users.map(user => {
      const due = Math.max(0, expectedPerMember - user.totalChanda);
      let chandaStatus = 'Pending';
      if (user.totalChanda >= expectedPerMember) chandaStatus = 'Fully Paid';
      else if (user.totalChanda > 0) chandaStatus = 'Partially Paid';

      return {
        _id: user._id,
        name: user.name,
        mobile: user.mobile,
        profileImage: user.profileImage,
        totalChanda: user.totalChanda,
        requiredChanda: expectedPerMember || 1000,
        due,
        status: user.status, chandaStatus: chandaStatus
      };
    });

    return apiSuccess(members);
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch members', null, 500);
  }
}


