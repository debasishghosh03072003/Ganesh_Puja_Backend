/**
 * POST /api/notifications/send
 *
 * Admin-only endpoint to send push notifications to all or specific members.
 *
 * Body:
 * {
 *   "title": "Ganesh Puja Reminder",
 *   "body": "Puja starts tomorrow at 8 AM.",
 *   "recipients": "all" | ["memberId1", "memberId2"],
 *   "screen": "home" | "contribution" | "expense" | "gallery" | "profile",
 *   "type": "announcement" | "contribution" | "expense" | "puja_reminder" | "meeting" | "general"
 * }
 */

import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { getCurrentUser } from '@/lib/auth';
import { sendToTokens } from '@/lib/fcm';
import {
  apiSuccess,
  apiError,
  apiUnauthorized,
  apiForbidden,
  apiServerError,
} from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Auth check
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return apiUnauthorized('Authentication required');
    }
    if (currentUser.role !== 'admin') {
      return apiForbidden('Only admins can send notifications');
    }

    const body = await req.json();
    const {
      title,
      body: messageBody,
      recipients = 'all',
      screen = 'home',
      type = 'announcement',
    } = body;

    // Validate
    if (!title || typeof title !== 'string' || !title.trim()) {
      return apiError('Notification title is required', null, 400);
    }
    if (!messageBody || typeof messageBody !== 'string' || !messageBody.trim()) {
      return apiError('Notification body is required', null, 400);
    }

    // Create notification record first (to get ID for payload)
    const notification = await Notification.create({
      title: title.trim(),
      body: messageBody.trim(),
      type,
      screen,
      recipients,
      sentBy: currentUser._id,
    });

    // Build member query
    let memberQuery: any = {
      status: 'active',
      'fcmTokens.0': { $exists: true }, // only members with at least one token
    };

    if (Array.isArray(recipients) && recipients.length > 0) {
      // Specific members - validate ObjectIds
      const validIds = recipients
        .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
        .map((id: string) => new mongoose.Types.ObjectId(id));

      if (validIds.length === 0) {
        return apiError('No valid member IDs provided in recipients', null, 400);
      }
      memberQuery._id = { $in: validIds };
    }
    // If recipients === "all", no additional filter

    // Fetch target members with their FCM tokens
    const members = await User.find(memberQuery).select('fcmTokens name').lean();

    if (members.length === 0) {
      await Notification.findByIdAndUpdate(notification._id, {
        deliveryStats: { total: 0, success: 0, failure: 0, invalidTokensRemoved: 0 },
      });

      return apiSuccess(
        {
          notificationId: notification._id,
          deliveryStats: { total: 0, success: 0, failure: 0, invalidTokensRemoved: 0 },
        },
        'No active members with registered devices found for selected recipients'
      );
    }

    // Collect all unique FCM tokens
    const allTokens: string[] = [];
    members.forEach((member) => {
      if (member.fcmTokens && Array.isArray(member.fcmTokens)) {
        member.fcmTokens.forEach((t: any) => {
          if (t?.token) allTokens.push(t.token);
        });
      }
    });

    if (allTokens.length === 0) {
      await Notification.findByIdAndUpdate(notification._id, {
        deliveryStats: { total: 0, success: 0, failure: 0, invalidTokensRemoved: 0 },
      });

      return apiSuccess(
        {
          notificationId: notification._id,
          deliveryStats: { total: 0, success: 0, failure: 0, invalidTokensRemoved: 0 },
        },
        'No FCM tokens found for the selected members'
      );
    }

    // Send via Firebase Admin SDK
    const { successCount, failureCount, invalidTokens } = await sendToTokens(allTokens, {
      title: title.trim(),
      body: messageBody.trim(),
      screen,
      type,
      notificationId: notification._id.toString(),
    });

    // Clean up invalid/expired tokens from database
    let invalidTokensRemoved = 0;
    if (invalidTokens.length > 0) {
      const cleanResult = await User.updateMany(
        { 'fcmTokens.token': { $in: invalidTokens } },
        { $pull: { fcmTokens: { token: { $in: invalidTokens } } } }
      );
      invalidTokensRemoved = cleanResult.modifiedCount;
      console.log(
        `[FCM] Cleaned ${invalidTokens.length} invalid tokens from ${invalidTokensRemoved} member(s)`
      );
    }

    const deliveryStats = {
      total: allTokens.length,
      success: successCount,
      failure: failureCount,
      invalidTokensRemoved,
    };

    // Update notification record with delivery result
    await Notification.findByIdAndUpdate(notification._id, { deliveryStats });

    console.log(
      `[FCM] Notification sent: "${title.trim()}" ? ${successCount}/${allTokens.length} delivered`
    );

    return apiSuccess(
      {
        notificationId: notification._id,
        devicesTargeted: allTokens.length,
        deliveryStats,
      },
      `Notification sent successfully to ${successCount} device(s)`
    );
  } catch (error: any) {
    console.error('[FCM] POST /api/notifications/send error:', error);
    return apiServerError(error?.message || 'Failed to send notification');
  }
}
