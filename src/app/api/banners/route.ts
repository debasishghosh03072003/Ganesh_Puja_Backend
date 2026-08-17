import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Banner from '@/models/Banner';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiForbidden } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all');

    const query: any = {};
    if (!all) {
      query.status = 'active';
      const now = new Date();
      query.$or = [
        { startDate: { $exists: false }, endDate: { $exists: false } },
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: { $exists: false } },
      ];
    }

    const banners = await Banner.find(query).sort({ displayOrder: 1, createdAt: -1 });
    return apiSuccess(banners, 'Banners fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch banners', null, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return apiForbidden('Only Admin can create banners');
    }

    const body = await req.json();
    const {
      title,
      subtitle,
      buttonText,
      buttonAction,
      imageUrl,
      imagePublicId,
      displayOrder,
      startDate,
      endDate,
      status,
    } = body;

    if (!title || !imageUrl) {
      return apiError('Title and Image URL are required');
    }

    await connectDB();

    const banner = await Banner.create({
      title,
      subtitle: subtitle || '',
      buttonText: buttonText || '',
      buttonAction: buttonAction || '',
      imageUrl,
      imagePublicId: imagePublicId || '',
      displayOrder: displayOrder || 0,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status: status || 'active',
    });

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Banner Created',
      entityType: 'Banner',
      entityId: banner._id.toString(),
      description: `${currentUser.name} created home banner: ${title}`,
    });

    return apiSuccess(banner, 'Banner created successfully', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to create banner', null, 500);
  }
}
