import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Contribution from '@/models/Contribution';
import Expense from '@/models/Expense';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const members = await User.find({ status: 'active' }).select('-password').sort({ name: 1 });

    const memberReports = await Promise.all(
      members.map(async (m) => {
        const contributions = await Contribution.find({ member: m._id });
        const expenses = await Expense.find({ paidBy: m._id });

        const totalContribution = contributions.reduce((sum, c) => sum + c.amount, 0);
        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

        return {
          memberId: m._id.toString(),
          name: m.name,
          mobile: m.mobile,
          email: m.email,
          role: m.role,
          profileImage: m.profileImage,
          totalContribution,
          totalExpense,
          netBalance: totalContribution - totalExpense,
          contributionsCount: contributions.length,
          expensesCount: expenses.length,
        };
      })
    );

    return apiSuccess(memberReports, 'Member report generated successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to generate member report', null, 500);
  }
}
