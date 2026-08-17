import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiUnauthorized } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return apiUnauthorized('Session expired or invalid token');
  }
  return apiSuccess({ user }, 'User session validated');
}
