import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Settings from '@/models/Settings';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiForbidden } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';

export async function GET() {
  try {
    await connectDB();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        committeeName: 'Shree Ganesh Puja Committee 2026',
        pujaYear: '2026',
        pujaDate: '2026-08-25',
        location: 'Central Pandal Ground',
        description: 'Private Committee Management System',
        expectedChandaTotal: 130000,
        expectedChandaPerMember: 10000,
      });
    }
    return apiSuccess(settings);
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch settings', null, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return apiForbidden('Only Admin can update system settings');
    }

    const body = await req.json();
    await connectDB();

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(body);
    } else {
      Object.assign(settings, body);
    }

    await settings.save();

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Settings Updated',
      entityType: 'Settings',
      entityId: settings._id.toString(),
      description: `${currentUser.name} updated committee settings`,
    });

    return apiSuccess(settings, 'Settings updated successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to update settings', null, 500);
  }
}
