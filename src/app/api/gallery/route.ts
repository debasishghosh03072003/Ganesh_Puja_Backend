import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Gallery from '@/models/Gallery';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiForbidden } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const query: any = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Gallery.countDocuments(query);
    const gallery = await Gallery.find(query)
      .populate('uploadedBy', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return apiSuccess({ gallery, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } }, 'Gallery photos fetched successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch gallery', null, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return apiForbidden('Authentication required');

    const body = await req.json();
    const { title, description, category, imageUrl, imagePublicId, imageBase64 } = body;

    let finalImageUrl = imageUrl || '';
    let finalPublicId = imagePublicId || '';

    if (imageBase64) {
      const uploaded = await uploadToCloudinary(imageBase64, 'ganesh_puja/gallery');
      finalImageUrl = uploaded.url;
      finalPublicId = uploaded.publicId;
    }

    if (!finalImageUrl) {
      return apiError('Image is required (provide imageUrl or imageBase64)');
    }

    await connectDB();

    const photo = await Gallery.create({
      title: title || 'Untitled',
      description: description || '',
      category: category || 'Puja',
      imageUrl: finalImageUrl,
      imagePublicId: finalPublicId,
      uploadedBy: currentUser._id,
    });

    await logActivity({
      userId: currentUser._id.toString(),
      action: 'Gallery Upload',
      entityType: 'Gallery',
      entityId: photo._id.toString(),
      description: `${currentUser.name} uploaded photo: ${title || 'Untitled'} (${category || 'Puja'})`,
    });

    const populated = await Gallery.findById(photo._id).populate('uploadedBy', 'name profileImage');
    return apiSuccess(populated, 'Gallery image uploaded successfully', 201);
  } catch (error: any) {
    return apiError(error.message || 'Failed to upload gallery image', null, 500);
  }
}
