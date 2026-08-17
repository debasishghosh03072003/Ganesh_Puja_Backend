import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Announcement from '@/models/Announcement';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiForbidden } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: any = {};
    if (status) {
      query.status = status;
    } else {
      // Default return Published for external/Flutter app
      query.status = 'Published';
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name profileImage')
      .sort({ publishDate: -1, createdAt: -1 });

    return apiSuccess(announcements, 'Announcements fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch announcements', null, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return apiForbidden('Only Admin can create announcements');
    }

    const body = await req.json();
    const { title, message, attachmentUrl, priority, publishDate, status } = body;

    if (!title || !message) {
      return apiError('Title and Message are required');
    }

    await connectDB();

    const announcement = await Announcement.create({
      title,
      message,
      attachmentUrl: attachmentUrl || '',
      priority: priority || 'Normal',
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      status: status || 'Published',
      createdBy: currentUser._id,
    });

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Announcement Created',
      entityType: 'Announcement',
      entityId: announcement._id.toString(),
      description: `${currentUser.name} published announcement: ${title}`,
    });

    const populated = await Announcement.findById(announcement._id).populate('createdBy', 'name profileImage');
    return apiSuccess(populated, 'Announcement created successfully', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to create announcement', null, 500);
  }
}
