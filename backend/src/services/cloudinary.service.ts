import { UploadApiResponse } from 'cloudinary';
import cloudinary from '../config/cloudinary';

/**
 * Uploads a file buffer to Cloudinary using upload_stream
 * @param fileBuffer The file buffer from Multer
 * @param folder The target Cloudinary folder name (e.g., 'kiduendu/products')
 */
export const uploadBufferToCloudinary = (
  fileBuffer: Buffer,
  folder: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes an image from Cloudinary using its publicId
 * @param publicId The Cloudinary publicId of the resource to delete
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`❌ Failed to delete image from Cloudinary (ID: ${publicId}):`, error);
  }
};
