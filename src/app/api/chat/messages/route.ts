import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Message from '@/models/Message';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiForbidden } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const messages = await Message.find({ deletedAt: { $exists: false } })
      .populate('sender', 'name profileImage role')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name' },
      })
      .sort({ createdAt: 1 })
      .limit(limit);

    const pinnedMessages = await Message.find({ isPinned: true, deletedAt: { $exists: false } })
      .populate('sender', 'name profileImage')
      .sort({ createdAt: -1 });

    return apiSuccess({ messages, pinnedMessages }, 'Chat messages fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch messages', null, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden();

    const body = await req.json();
    const { content, attachmentUrl, attachmentType, replyTo } = body;

    if (!content && !attachmentUrl) {
      return apiError('Message content or attachment is required');
    }

    await connectDB();

    const msg = await Message.create({
      sender: currentUser._id,
      content: content || '',
      attachmentUrl: attachmentUrl || '',
      attachmentType: attachmentType || (attachmentUrl ? 'image' : undefined),
      replyTo: replyTo || undefined,
      readBy: [currentUser._id],
    });

    const populated = await Message.findById(msg._id)
      .populate('sender', 'name profileImage role')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name' },
      });

    return apiSuccess(populated, 'Message sent successfully', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to send message', null, 500);
  }
}
