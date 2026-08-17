import Activity from '@/models/Activity';
import { connectDB } from './db';

export interface LogActivityParams {
  userId: string;
  action: string;
  entityType: 'User' | 'Contribution' | 'Expense' | 'Banner' | 'Gallery' | 'Announcement' | 'Task' | 'Message' | 'Settings';
  entityId?: string;
  description: string;
}

export async function logActivity({
  userId,
  action,
  entityType,
  entityId,
  description,
}: LogActivityParams) {
  try {
    await connectDB();
    await Activity.create({
      user: userId,
      action,
      entityType,
      entityId,
      description,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
