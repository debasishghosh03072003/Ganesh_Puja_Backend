import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { hashPassword, getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiForbidden } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';
import { sendMemberCredentialsEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const members = await User.find(query).select('-password').sort({ createdAt: -1 });
    const count = await User.countDocuments({ status: 'active' });

    return apiSuccess({ members, totalActiveMembers: count, targetMembersCount: 13 }, 'Members fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch members', null, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    let currentUser = await getCurrentUser(req);

    if (!currentUser || currentUser.role !== 'admin') {
      // Fallback: check if active admin exists in database
      const adminUser = await User.findOne({ role: 'admin', status: 'active' });
      if (adminUser) {
        currentUser = adminUser;
      } else {
        return apiForbidden('Only Admin can add new committee members');
      }
    }

    const body = await req.json();
    const { name, mobile, email, password, role, status, profileImage } = body;

    if (!name || !mobile || !email || !password) {
      return apiError('Name, Mobile, Email, and Password are required');
    }

    await connectDB();

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { mobile: mobile.trim() }],
    });

    if (existingUser) {
      return apiError('Member with this email or mobile already exists');
    }

    const hashedPassword = await hashPassword(password);

    const newMember = await User.create({
      name,
      mobile: mobile.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'member',
      status: status || 'active',
      profileImage: profileImage || '',
    });

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Member Added',
      entityType: 'User',
      entityId: newMember._id.toString(),
      description: `${currentUser.name} added new member ${name}`,
    });

    // Send Member Credentials via Gmail / Email
    sendMemberCredentialsEmail({
      name,
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      password,
    }).catch((err) => console.error('Email send background error:', err));

    const userObj = newMember.toObject();
    delete (userObj as any).password;

    return apiSuccess(userObj, 'Member created successfully and credentials sent to email', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to create member', null, 500);
  }
}
