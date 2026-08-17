/**
 * /api/members/fcm-token
 *
 * POST  - Register or update FCM device token for the authenticated member.
 *          Supports multiple tokens per member (multiple devices).
 *          Does NOT create duplicate tokens - upserts by token string.
 *
 * DELETE - Remove the current device FCM token on logout.
 *           Only removes the specific token; other devices remain registered.
 */

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import {
  apiSuccess,
  apiError,
  apiUnauthorized,
  apiServerError,
} from '@/lib/api-response';

// --- POST /api/members/fcm-token ---------------------------------------------

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return apiUnauthorized('Please login to register FCM token');
    }

    const body = await req.json();
    const token: string = (body?.token ?? '').toString().trim();
    const deviceType: string = (body?.deviceType ?? 'android').toString().trim();

    if (!token) {
      return apiError('FCM token is required', null, 400);
    }

    if (!['android', 'ios', 'web'].includes(deviceType)) {
      return apiError('Invalid deviceType. Must be android, ios, or web', null, 400);
    }

    const memberId = currentUser._id;

    // Check if this token already exists for this member
    const existingMember = await User.findOne(
      { _id: memberId, 'fcmTokens.token': token },
      { 'fcmTokens.$': 1 }
    );

    if (existingMember) {
      // Token exists - update deviceType (updatedAt auto-updates via timestamps)
      await User.updateOne(
        { _id: memberId, 'fcmTokens.token': token },
        {
          $set: {
            'fcmTokens.$.deviceType': deviceType,
          },
        }
      );
      console.log(`[FCM] Token updated for member: ${memberId} (${currentUser.name})`);
    } else {
      // New token - push to array
      await User.updateOne(
        { _id: memberId },
        {
          $push: {
            fcmTokens: { token, deviceType },
          },
        }
      );
      console.log(`[FCM] New token registered for member: ${memberId} (${currentUser.name})`);
    }

    return apiSuccess({ registered: true }, 'FCM token registered successfully');
  } catch (error: any) {
    console.error('[FCM] POST /api/members/fcm-token error:', error);
    return apiServerError(error?.message || 'Failed to register FCM token');
  }
}

// --- DELETE /api/members/fcm-token -------------------------------------------

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      // If already logged out, silently succeed - no harm done
      return apiSuccess({ removed: false }, 'Already logged out');
    }

    const body = await req.json().catch(() => ({}));
    const token: string = (body?.token ?? '').toString().trim();

    if (!token) {
      return apiError('FCM token is required', null, 400);
    }

    const result = await User.updateOne(
      { _id: currentUser._id },
      { $pull: { fcmTokens: { token } } }
    );

    const removed = result.modifiedCount > 0;
    console.log(
      `[FCM] Token ${removed ? 'removed' : 'not found'} for member: ${currentUser._id} (${currentUser.name})`
    );

    return apiSuccess({ removed }, removed ? 'FCM token removed' : 'Token not found (may have been removed already)');
  } catch (error: any) {
    console.error('[FCM] DELETE /api/members/fcm-token error:', error);
    return apiServerError(error?.message || 'Failed to remove FCM token');
  }
}
