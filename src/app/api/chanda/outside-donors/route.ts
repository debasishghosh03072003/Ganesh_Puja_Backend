import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import OutsideContribution from '@/models/OutsideContribution';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiForbidden } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden('Authentication required');

    await connectDB();
    const outsideDonors = await OutsideContribution.find()
      .populate('addedBy', 'name')
      .sort({ date: -1 });

    return apiSuccess(outsideDonors);
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch outside donors', null, 500);
  }
}

// POST a new outside donor payment (ADMIN ONLY)
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden('Authentication required');
    if (currentUser.role !== 'admin') return apiForbidden('Admin access required');

    const body = await req.json();
    const { donorName, mobile, amount, purpose, note, date } = body;

    if (!donorName) return apiError('Donor name is required');
    if (!amount || Number(amount) <= 0) return apiError('Amount must be greater than 0');

    await connectDB();

    const contribution = await OutsideContribution.create({
      donorName,
      mobile: mobile || '',
      amount: Number(amount),
      purpose: purpose || 'Puja Chanda',
      date: date ? new Date(date) : new Date(),
      note: note || '',
      addedBy: currentUser._id,
    });

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Outside Donor Added',
      entityType: 'Contribution',
      entityId: contribution._id.toString(),
      description: `${currentUser.name} recorded ₹${amount} from outside donor ${donorName}`,
    });

    const populated = await OutsideContribution.findById(contribution._id).populate('addedBy', 'name');

    return apiSuccess(populated, 'Outside donor recorded successfully', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to record outside donor', null, 500);
  }
}
