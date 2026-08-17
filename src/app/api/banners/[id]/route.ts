import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Banner from '@/models/Banner';
import { getCurrentUser } from '@/lib/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { apiSuccess, apiError, apiNotFound, apiForbidden } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return apiForbidden();
    }

    const body = await req.json();
    await connectDB();

    const banner = await Banner.findById(params.id);
    if (!banner) return apiNotFound('Banner not found');

    Object.assign(banner, body);
    await banner.save();

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Banner Updated',
      entityType: 'Banner',
      entityId: banner._id.toString(),
      description: `${currentUser.name} updated home banner: ${banner.title}`,
    });

    return apiSuccess(banner, 'Banner updated successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to update banner', null, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return apiForbidden('Only Admin can delete banners');
    }

    await connectDB();
    const banner = await Banner.findById(params.id);
    if (!banner) return apiNotFound('Banner not found');

    if (banner.imagePublicId) {
      await deleteFromCloudinary(banner.imagePublicId);
    }

    await Banner.findByIdAndDelete(params.id);

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Banner Deleted',
      entityType: 'Banner',
      entityId: params.id,
      description: `${currentUser.name} deleted home banner: ${banner.title}`,
    });

    return apiSuccess(null, 'Banner deleted successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to delete banner', null, 500);
  }
}
