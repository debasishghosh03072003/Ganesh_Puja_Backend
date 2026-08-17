import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Task from '@/models/Task';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiNotFound, apiForbidden } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden();

    const body = await req.json();
    await connectDB();

    const task = await Task.findById(params.id);
    if (!task) return apiNotFound('Task not found');

    const oldStatus = task.status;

    if (body.deadline) body.deadline = new Date(body.deadline);
    Object.assign(task, body);
    await task.save();

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Task Updated',
      entityType: 'Task',
      entityId: task._id.toString(),
      description: `${currentUser.name} updated task status to "${task.status}" for "${task.title}"`,
    });

    const updated = await Task.findById(params.id)
      .populate('assignedTo', 'name profileImage mobile')
      .populate('createdBy', 'name');

    return apiSuccess(updated, 'Task updated successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to update task', null, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden();

    await connectDB();
    const task = await Task.findById(params.id);
    if (!task) return apiNotFound('Task not found');

    await Task.findByIdAndDelete(params.id);

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Task Deleted',
      entityType: 'Task',
      entityId: params.id,
      description: `${currentUser.name} deleted task: ${task.title}`,
    });

    return apiSuccess(null, 'Task deleted successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to delete task', null, 500);
  }
}
