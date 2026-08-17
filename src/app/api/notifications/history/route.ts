/**
 * GET /api/notifications/history
 *
 * Admin endpoint to view notification dispatch history (newest first).
 * Supports pagination with ?page=1&limit=20.
 */

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';
import { getCurrentUser } from '@/lib/auth';
import {
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiServerError,
} from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return apiUnauthorized('Authentication required');
    }
    if (currentUser.role !== 'admin') {
      return apiForbidden('Only admins can access notification history');
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find()
        .sort({ sentAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sentBy', 'name email role')
        .lean(),
      Notification.countDocuments(),
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
      'Notification history fetched successfully'
    );
  } catch (error: any) {
    console.error('[FCM] GET /api/notifications/history error:', error);
    return apiServerError(error?.message || 'Failed to fetch notification history');
  }
}
