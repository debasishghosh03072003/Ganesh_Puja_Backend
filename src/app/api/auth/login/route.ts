import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { comparePassword, createToken, setAuthCookie } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return apiError('Email/Mobile and password are required', null, 400);
    }

    await connectDB();

    // Find user by email or mobile
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { mobile: identifier.trim() },
      ],
    });

    if (!user) {
      return apiError('Invalid credentials', null, 401);
    }

    if (user.status !== 'active') {
      return apiError('Account is inactive. Contact Administrator.', null, 403);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return apiError('Invalid credentials', null, 401);
    }

    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await setAuthCookie(token);

    await logActivity({
      userId: user._id.toString(),
      action: 'Login',
      entityType: 'User',
      entityId: user._id.toString(),
      description: `${user.name} logged into the system`,
    });

    const userObj = user.toObject();
    delete (userObj as any).password;

    return apiSuccess({ user: userObj, token }, 'Login successful');
  } catch (error: any) {
    console.error('Login error:', error);
    return apiError(error.message || 'Login failed', null, 500);
  }
}
