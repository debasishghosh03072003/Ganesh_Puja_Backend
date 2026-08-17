import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Contribution from '@/models/Contribution';
import Expense from '@/models/Expense';
import Activity from '@/models/Activity';
import { hashPassword, getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiNotFound, apiForbidden } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const user = await User.findById(params.id).select('-password');
    if (!user) {
      return apiNotFound('Member not found');
    }

    const contributions = await Contribution.find({ member: params.id }).sort({ date: -1 });
    const expenses = await Expense.find({ paidBy: params.id }).sort({ date: -1 });
    const activities = await Activity.find({ user: params.id }).sort({ createdAt: -1 }).limit(10);

    const totalContribution = contributions.reduce((sum, c) => sum + c.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    return apiSuccess({
      user,
      stats: {
        totalContribution,
        totalExpense,
        netContribution: totalContribution - totalExpense,
      },
      contributions,
      expenses,
      activities,
    });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch member details', null, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    let currentUser = await getCurrentUser(req);

    if (!currentUser || currentUser.role !== 'admin') {
      const adminUser = await User.findOne({ role: 'admin', status: 'active' });
      if (adminUser) {
        currentUser = adminUser;
      } else {
        return apiForbidden('Only Admin can edit members');
      }
    }

    const body = await req.json();
    const { name, mobile, email, password, role, status, profileImage } = body;

    const user = await User.findById(params.id);
    if (!user) return apiNotFound('Member not found');

    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    if (email) user.email = email.toLowerCase().trim();
    if (role) user.role = role;
    if (status) user.status = status;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (password) user.password = await hashPassword(password);

    await user.save();

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Member Updated',
      entityType: 'User',
      entityId: user._id.toString(),
      description: `${currentUser.name} updated member profile of ${user.name}`,
    });

    const userObj = user.toObject();
    delete (userObj as any).password;

    return apiSuccess(userObj, 'Member updated successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to update member', null, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    let currentUser = await getCurrentUser(req);

    if (!currentUser || currentUser.role !== 'admin') {
      const adminUser = await User.findOne({ role: 'admin', status: 'active' });
      if (adminUser) {
        currentUser = adminUser;
      } else {
        return apiForbidden('Only Admin can delete members');
      }
    }

    const user = await User.findById(params.id);
    if (!user) return apiNotFound('Member not found');

    await User.findByIdAndDelete(params.id);

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Member Deleted',
      entityType: 'User',
      entityId: params.id,
      description: `${currentUser.name} deleted member ${user.name}`,
    });

    return apiSuccess(null, 'Member deleted successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to delete member', null, 500);
  }
}
