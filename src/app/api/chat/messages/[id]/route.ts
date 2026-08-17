import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Message from '@/models/Message';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiNotFound, apiForbidden } from '@/lib/api-response';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden();

    await connectDB();
    const msg = await Message.findById(params.id);
    if (!msg) return apiNotFound('Message not found');

    // Only sender or admin can delete
    const isSender = msg.sender.toString() === currentUser._id.toString();
    const isAdmin = currentUser.role === 'admin';

    if (!isSender && !isAdmin) {
      return apiForbidden('You can only delete your own messages');
    }

    msg.deletedAt = new Date();
    await msg.save();

    return apiSuccess(null, 'Message deleted');
  } catch (error: any) {
    return apiError(error.message || 'Failed to delete message', null, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden();

    const { action } = await req.json(); // action: 'pin' or 'unpin'
    await connectDB();

    const msg = await Message.findById(params.id);
    if (!msg) return apiNotFound('Message not found');

    if (action === 'pin' || action === 'unpin') {
      msg.isPinned = action === 'pin';
      await msg.save();
    }

    return apiSuccess(msg, `Message ${msg.isPinned ? 'pinned' : 'unpinned'}`);
  } catch (error: any) {
    return apiError(error.message || 'Failed to update message', null, 500);
  }
}
