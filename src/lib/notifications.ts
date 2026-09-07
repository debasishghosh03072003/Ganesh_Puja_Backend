/**
 * notifications.ts - Auto-notification helper for system-triggered events
 * Location: src/lib/notifications.ts
 *
 * Used internally by API routes (contributions, expenses, etc.) to automatically
 * send push notifications to all active members when events occur.
 * Does NOT affect the admin-panel /api/notifications/send endpoint.
 */

import mongoose from 'mongoose';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { sendToTokens, FcmPayload } from '@/lib/fcm';
import { NotificationType } from '@/models/Notification';

export interface AutoNotificationOptions {
  title: string;
  body: string;
  type: NotificationType;
  screen?: string;
  /** Set to a system user ObjectId to record sentBy, or leave undefined */
  sentBy?: mongoose.Types.ObjectId;
}

/**
 * Sends an automatic push notification to ALL active members with registered FCM tokens.
 * Saves the notification record to DB (visible in notification history).
 * Invalid/expired tokens are cleaned up automatically.
 *
 * This is a fire-and-forget helper — it catches and logs errors internally
 * so that calling routes are never blocked if FCM fails.
 */
export async function sendAutoNotificationToAll(
  options: AutoNotificationOptions
): Promise<void> {
  const { title, body, type, screen = 'home', sentBy } = options;

  try {
    // Create notification record first (recipients = "all")
    const notification = await Notification.create({
      title,
      body,
      type,
      screen,
      recipients: 'all',
      ...(sentBy ? { sentBy } : {}),
      deliveryStats: { total: 0, success: 0, failure: 0, invalidTokensRemoved: 0 },
    });

    // Fetch all active members that have at least one FCM token
    const members = await User.find({
      status: 'active',
      'fcmTokens.0': { $exists: true },
    })
      .select('fcmTokens')
      .lean();

    if (members.length === 0) {
      console.log(`[AutoNotif] No active members with FCM tokens for "${title}"`);
      return;
    }

    // Collect all unique tokens
    const allTokens: string[] = [];
    members.forEach((member) => {
      if (member.fcmTokens && Array.isArray(member.fcmTokens)) {
        member.fcmTokens.forEach((t: any) => {
          if (t?.token) allTokens.push(t.token);
        });
      }
    });

    if (allTokens.length === 0) {
      console.log(`[AutoNotif] No FCM tokens found for "${title}"`);
      return;
    }

    const payload: FcmPayload = {
      title,
      body,
      screen,
      type,
      notificationId: notification._id.toString(),
    };

    const { successCount, failureCount, invalidTokens } = await sendToTokens(
      allTokens,
      payload
    );

    // Clean up invalid tokens from DB
    let invalidTokensRemoved = 0;
    if (invalidTokens.length > 0) {
      const cleanResult = await User.updateMany(
        { 'fcmTokens.token': { $in: invalidTokens } },
        { $pull: { fcmTokens: { token: { $in: invalidTokens } } } }
      );
      invalidTokensRemoved = cleanResult.modifiedCount;
    }

    // Update delivery stats on notification record
    await Notification.findByIdAndUpdate(notification._id, {
      deliveryStats: {
        total: allTokens.length,
        success: successCount,
        failure: failureCount,
        invalidTokensRemoved,
      },
    });

    console.log(
      `[AutoNotif] "${title}" → ${successCount}/${allTokens.length} delivered, ${failureCount} failed`
    );
  } catch (err: any) {
    // Never throw — auto notifications must not break the primary API response
    console.error(`[AutoNotif] Failed to send auto notification "${title}":`, err?.message ?? err);
  }
}
