import { removeAuthCookie } from '@/lib/auth';
import { apiSuccess } from '@/lib/api-response';

export async function POST() {
  await removeAuthCookie();
  return apiSuccess(null, 'Logged out successfully');
}
