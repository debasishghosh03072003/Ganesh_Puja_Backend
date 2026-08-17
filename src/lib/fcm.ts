/**
 * fcm.ts - Firebase Admin SDK wrapper for FCM push notifications
 * Location: src/lib/fcm.ts
 *
 * Credentials loaded from .env.local:
 *   FIREBASE_PROJECT_ID=modak-d836e
 *   FIREBASE_CLIENT_EMAIL=<from service account JSON>
 *   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';

function getFirebaseAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0 && existingApps[0]) {
    return existingApps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Next.js env parser may deliver the key in different forms:
  // 1. Already has real \n (actual newline chars) — if Next.js parsed the quoted string
  // 2. Has literal \\n (two chars: backslash + n) — if it passed through unprocessed
  // We normalize to real newlines and strip any accidental surrounding quotes.
  const rawKey = process.env.FIREBASE_PRIVATE_KEY ?? '';
  const privateKey = rawKey
    .replace(/^"|"$/g, '')          // strip surrounding quotes if any
    .replace(/\\n/g, '\n');          // convert all \\n sequences to real newlines

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      '[FCM] Firebase Admin credentials missing in .env.local\n' +
      'Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export interface FcmPayload {
  title: string;
  body: string;
  screen?: string;
  type?: string;
  notificationId?: string;
}

export interface FcmSendResult {
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
}

export async function sendToTokens(tokens: string[], payload: FcmPayload): Promise<FcmSendResult> {
  if (!tokens || tokens.length === 0) {
    return { successCount: 0, failureCount: 0, invalidTokens: [] };
  }

  const app = getFirebaseAdminApp();
  const messaging = getMessaging(app);
  const uniqueTokens = [...new Set(tokens.filter(Boolean))];
  const invalidTokens: string[] = [];
  let totalSuccess = 0;
  let totalFailure = 0;
  const BATCH_SIZE = 500;

  for (let i = 0; i < uniqueTokens.length; i += BATCH_SIZE) {
    const batch = uniqueTokens.slice(i, i + BATCH_SIZE);

    const message: MulticastMessage = {
      notification: { title: payload.title, body: payload.body },
      data: {
        title: payload.title ?? '',
        body: payload.body ?? '',
        screen: payload.screen ?? 'home',
        type: payload.type ?? 'general',
        notificationId: payload.notificationId ?? '',
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'ganesh_puja_notifications_v2',
          sound: 'ganesh_notification',
          priority: 'max',
          defaultSound: false,
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
      },
      tokens: batch,
    };

    try {
      const response = await messaging.sendEachForMulticast(message);
      totalSuccess += response.successCount;
      totalFailure += response.failureCount;

      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const code = resp.error?.code ?? '';
          console.warn(`[FCM] Send failed for token[${idx}]: ${resp.error?.message}`);
          if (
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-argument' ||
            code === 'messaging/invalid-recipient'
          ) {
            invalidTokens.push(batch[idx]);
          }
        }
      });
    } catch (err: any) {
      console.error('[FCM] Batch send error:', err?.message ?? err);
      totalFailure += batch.length;
    }
  }

  console.log(`[FCM] Result: ${totalSuccess} success, ${totalFailure} failure, ${invalidTokens.length} invalid tokens`);
  return { successCount: totalSuccess, failureCount: totalFailure, invalidTokens };
}

