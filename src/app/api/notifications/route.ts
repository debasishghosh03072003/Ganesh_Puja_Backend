/**
 * /api/notifications
 *
 * GET  - Member/Admin notification list. Returns notifications targeted to "all" or specifically to this member.
 */

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';
import { getCurrentUser } from '@/lib/auth';
import {
  apiSuccess,
  apiUnauthorized,
  apiServerError,
} from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return apiUnauthorized('Authentication required');
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30', 10)));
    const skip = (page - 1) * limit;

    let query: any = {};
    if (currentUser.role !== 'admin') {
      // Normal members only see "all" or notifications sent specifically to them
      query = {
        $or: [
          { recipients: 'all' },
          { recipients: currentUser._id.toString() },
          { recipients: currentUser._id },
        ],
      };
    }

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ sentAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sentBy', 'name')
        .lean(),
      Notification.countDocuments(query),
    ]);

    return apiSuccess(
      {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Notifications fetched successfully'
    );
  } catch (error: any) {
    console.error('[FCM] GET /api/notifications error:', error);
    return apiServerError(error?.message || 'Failed to fetch notifications');
  }
}
