import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { apiSuccess, apiError, apiForbidden } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
        return apiError('Session expired or invalid. Please log out and log in again.', null, 401);
    }
    
    if (currentUser.status !== 'active') {
        return apiForbidden('Account is inactive. Cannot upload files.');
    }
    
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'ganesh_puja';

    if (!file) {
      return apiError('No file uploaded');
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'image/jpeg';
    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

    const uploadResult = await uploadToCloudinary(base64Data, folder);

    return apiSuccess({
      url: uploadResult.url,
      publicId: uploadResult.publicId,
    }, 'File uploaded successfully');
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return apiError(error.message || 'File upload failed', null, 500);
  }
}
