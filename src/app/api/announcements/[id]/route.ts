import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Announcement from '@/models/Announcement';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiNotFound, apiForbidden } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser || currentUser.role !== 'admin') return apiForbidden();

    const body = await req.json();
    await connectDB();

    const item = await Announcement.findById(params.id);
    if (!item) return apiNotFound('Announcement not found');

    Object.assign(item, body);
    await item.save();

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Announcement Updated',
      entityType: 'Announcement',
      entityId: item._id.toString(),
      description: `${currentUser.name} updated announcement: ${item.title}`,
    });

    const updated = await Announcement.findById(params.id).populate('createdBy', 'name profileImage');
    return apiSuccess(updated, 'Announcement updated successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to update announcement', null, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser || currentUser.role !== 'admin') return apiForbidden();

    await connectDB();
    const item = await Announcement.findById(params.id);
    if (!item) return apiNotFound('Announcement not found');

    await Announcement.findByIdAndDelete(params.id);

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Announcement Deleted',
      entityType: 'Announcement',
      entityId: params.id,
      description: `${currentUser.name} deleted announcement: ${item.title}`,
    });

    return apiSuccess(null, 'Announcement deleted successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to delete announcement', null, 500);
  }
}
