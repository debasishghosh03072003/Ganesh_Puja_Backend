import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import ExpenseCategory from '@/models/ExpenseCategory';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiForbidden } from '@/lib/api-response';

export async function GET() {
  try {
    await connectDB();
    const categories = await ExpenseCategory.find().sort({ name: 1 });
    return apiSuccess(categories);
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch categories', null, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return apiForbidden('Only Admin can add custom categories');
    }

    const { name } = await req.json();
    if (!name) return apiError('Category name is required');

    await connectDB();

    const existing = await ExpenseCategory.findOne({ name: name.trim() });
    if (existing) return apiError('Category already exists');

    const cat = await ExpenseCategory.create({ name: name.trim(), isSystem: false });
    return apiSuccess(cat, 'Category created successfully', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to create category', null, 500);
  }
}
