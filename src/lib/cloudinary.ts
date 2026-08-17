import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export interface UploadResult {
  url: string;
  publicId: string;
}

export async function uploadToCloudinary(
  fileBufferOrBase64: string,
  folder = 'ganesh_puja'
): Promise<UploadResult> {
  const isCloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (!isCloudinaryConfigured) {
    console.warn('Cloudinary not configured. Returning fallback image URL.');
    // Return base64 or fallback url if short, otherwise generate a mock image URL
    if (fileBufferOrBase64.startsWith('data:image')) {
      // If it's a data URL, we can use it directly or generate a unique placeholder
      const mockId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return {
        url: fileBufferOrBase64.length < 500000 ? fileBufferOrBase64 : `https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800&auto=format&fit=crop`,
        publicId: mockId,
      };
    }
    return {
      url: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800&auto=format&fit=crop',
      publicId: `mock_${Date.now()}`,
    };
  }

  try {
    const result = await cloudinary.uploader.upload(fileBufferOrBase64, {
      folder,
      resource_type: 'auto',
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Fallback if Cloudinary API fails
    return {
      url: fileBufferOrBase64.startsWith('data:image') ? fileBufferOrBase64 : 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800&auto=format&fit=crop',
      publicId: `fallback_${Date.now()}`,
    };
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  if (!publicId || publicId.startsWith('mock_') || publicId.startsWith('fallback_')) {
    return true;
  }
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}
