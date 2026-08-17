import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Task from '@/models/Task';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiForbidden } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const assignedTo = searchParams.get('assignedTo');
    const status = searchParams.get('status');

    const query: any = {};
    if (assignedTo) query.assignedTo = assignedTo;
    if (status) query.status = status;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name profileImage mobile')
      .populate('createdBy', 'name')
      .sort({ deadline: 1, createdAt: -1 });

    return apiSuccess(tasks, 'Tasks fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch tasks', null, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden();

    const body = await req.json();
    const { title, description, assignedTo, deadline, priority, status } = body;

    if (!title || !assignedTo || !deadline) {
      return apiError('Title, Assigned To member, and Deadline are required');
    }

    await connectDB();

    const assignee = await User.findById(assignedTo);
    if (!assignee) return apiError('Assigned member not found');

    const task = await Task.create({
      title,
      description: description || '',
      assignedTo,
      deadline: new Date(deadline),
      priority: priority || 'Medium',
      status: status || 'Pending',
      createdBy: currentUser._id,
    });

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Task Created',
      entityType: 'Task',
      entityId: task._id.toString(),
      description: `${currentUser.name} assigned task "${title}" to ${assignee.name}`,
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name profileImage mobile')
      .populate('createdBy', 'name');

    return apiSuccess(populated, 'Task created successfully', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to create task', null, 500);
  }
}
