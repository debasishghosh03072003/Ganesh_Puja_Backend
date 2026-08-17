import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Gallery from '@/models/Gallery';
import { getCurrentUser } from '@/lib/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { apiSuccess, apiError, apiNotFound, apiForbidden } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden();

    const body = await req.json();
    await connectDB();

    const item = await Gallery.findById(params.id);
    if (!item) return apiNotFound('Gallery photo not found');

    Object.assign(item, body);
    await item.save();

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Gallery Updated',
      entityType: 'Gallery',
      entityId: item._id.toString(),
      description: `${currentUser.name} updated gallery photo details: ${item.title}`,
    });

    const updated = await Gallery.findById(params.id).populate('uploadedBy', 'name profileImage');
    return apiSuccess(updated, 'Gallery photo updated successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to update photo', null, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden();

    await connectDB();
    const item = await Gallery.findById(params.id);
    if (!item) return apiNotFound('Gallery photo not found');

    if (item.imagePublicId) {
      await deleteFromCloudinary(item.imagePublicId);
    }

    await Gallery.findByIdAndDelete(params.id);

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Gallery Deleted',
      entityType: 'Gallery',
      entityId: params.id,
      description: `${currentUser.name} deleted photo: ${item.title}`,
    });

    return apiSuccess(null, 'Gallery photo deleted successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to delete photo', null, 500);
  }
}
