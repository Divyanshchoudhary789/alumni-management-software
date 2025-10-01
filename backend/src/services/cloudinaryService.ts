import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../config/logger';
import { createError } from '../middleware/errorHandler';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify Cloudinary configuration
const verifyCloudinaryConfig = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  
  if (!cloud_name || !api_key || !api_secret) {
    logger.error('Cloudinary configuration missing. Please check environment variables.');
    throw new Error('Cloudinary configuration incomplete');
  }
  
  logger.info('Cloudinary configured successfully', { cloud_name });
};

// Initialize and verify configuration
try {
  verifyCloudinaryConfig();
} catch (error) {
  logger.error('Failed to configure Cloudinary:', error);
}

/**
 * Upload image to Cloudinary
 */
export const uploadToCloudinary = async (
  filePath: string,
  options: {
    folder?: string;
    public_id?: string;
    transformation?: any;
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
  } = {}
): Promise<{
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}> => {
  try {
    const uploadOptions = {
      folder: options.folder || 'alumni-management',
      public_id: options.public_id,
      resource_type: options.resource_type || 'auto',
      transformation: options.transformation,
      overwrite: true,
      invalidate: true,
    };

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    
    logger.info('File uploaded to Cloudinary successfully', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      bytes: result.bytes
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    logger.error('Cloudinary upload failed:', error);
    throw createError(
      'Failed to upload image to cloud storage',
      500,
      'CLOUDINARY_UPLOAD_ERROR',
      { originalError: error }
    );
  }
};

/**
 * Upload profile image with optimizations
 */
export const uploadProfileImage = async (filePath: string, userId: string) => {
  return uploadToCloudinary(filePath, {
    folder: 'alumni-management/profiles',
    public_id: `profile_${userId}_${Date.now()}`,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' },
      { format: 'auto' }
    ]
  });
};

/**
 * Upload event image with optimizations
 */
export const uploadEventImage = async (filePath: string, eventId?: string) => {
  return uploadToCloudinary(filePath, {
    folder: 'alumni-management/events',
    public_id: eventId ? `event_${eventId}_${Date.now()}` : undefined,
    transformation: [
      { width: 800, height: 600, crop: 'fill' },
      { quality: 'auto:good' },
      { format: 'auto' }
    ]
  });
};

/**
 * Upload document to Cloudinary
 */
export const uploadDocument = async (filePath: string, documentName?: string) => {
  return uploadToCloudinary(filePath, {
    folder: 'alumni-management/documents',
    public_id: documentName ? `doc_${documentName}_${Date.now()}` : undefined,
    resource_type: 'raw'
  });
};

/**
 * Delete file from Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      logger.info('File deleted from Cloudinary successfully', { publicId });
    } else {
      logger.warn('File deletion from Cloudinary failed', { publicId, result });
    }
  } catch (error) {
    logger.error('Cloudinary deletion failed:', error);
    throw createError(
      'Failed to delete image from cloud storage',
      500,
      'CLOUDINARY_DELETE_ERROR',
      { originalError: error }
    );
  }
};

/**
 * Get optimized image URL
 */
export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
): string => {
  try {
    return cloudinary.url(publicId, {
      width: options.width,
      height: options.height,
      crop: options.crop || 'fill',
      quality: options.quality || 'auto:good',
      format: options.format || 'auto',
      secure: true
    });
  } catch (error) {
    logger.error('Failed to generate optimized URL:', error);
    return '';
  }
};

/**
 * Generate image variants for different use cases
 */
export const generateImageVariants = (publicId: string) => {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 150, height: 150 }),
    small: getOptimizedImageUrl(publicId, { width: 300, height: 300 }),
    medium: getOptimizedImageUrl(publicId, { width: 600, height: 600 }),
    large: getOptimizedImageUrl(publicId, { width: 1200, height: 1200 }),
    original: cloudinary.url(publicId, { secure: true })
  };
};

/**
 * Get upload signature for direct uploads from frontend
 */
export const getUploadSignature = (folder: string, publicId?: string) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  const params: any = {
    timestamp,
    folder,
    overwrite: true,
    invalidate: true
  };
  
  if (publicId) {
    params.public_id = publicId;
  }
  
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);
  
  return {
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
    ...(publicId && { public_id: publicId })
  };
};

/**
 * Search images in Cloudinary
 */
export const searchImages = async (
  query: string,
  options: {
    max_results?: number;
    next_cursor?: string;
    sort_by?: string;
  } = {}
) => {
  try {
    const result = await cloudinary.search
      .expression(query)
      .max_results(options.max_results || 20)
      .next_cursor(options.next_cursor)
      .sort_by(options.sort_by || 'created_at', 'desc')
      .execute();
    
    return result;
  } catch (error) {
    logger.error('Cloudinary search failed:', error);
    throw createError(
      'Failed to search images',
      500,
      'CLOUDINARY_SEARCH_ERROR',
      { originalError: error }
    );
  }
};

/**
 * Get folder contents
 */
export const getFolderContents = async (folderPath: string) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folderPath,
      max_results: 100
    });
    
    return result;
  } catch (error) {
    logger.error('Failed to get folder contents:', error);
    throw createError(
      'Failed to get folder contents',
      500,
      'CLOUDINARY_FOLDER_ERROR',
      { originalError: error }
    );
  }
};

export { cloudinary };