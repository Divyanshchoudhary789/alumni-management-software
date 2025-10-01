import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { Request } from 'express';
import { logger } from '../config/logger';
import { createError } from '../middleware/errorHandler';
import { 
  uploadProfileImage as cloudinaryUploadProfile,
  uploadEventImage as cloudinaryUploadEvent,
  uploadDocument as cloudinaryUploadDocument,
  deleteFromCloudinary,
  generateImageVariants
} from './cloudinaryService';

// File upload configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Ensure upload directories exist
const ensureUploadDirs = async (): Promise<void> => {
  const dirs = [
    path.join(UPLOAD_DIR),
    path.join(UPLOAD_DIR, 'profiles'),
    path.join(UPLOAD_DIR, 'events'),
    path.join(UPLOAD_DIR, 'documents'),
    path.join(UPLOAD_DIR, 'temp')
  ];

  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
      logger.info(`Created upload directory: ${dir}`);
    }
  }
};

// Initialize upload directories
ensureUploadDirs().catch(error => {
  logger.error('Failed to create upload directories:', error);
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let uploadPath = path.join(UPLOAD_DIR, 'temp');
    
    // Determine upload path based on file type and route
    if (req.path.includes('/alumni') && file.fieldname === 'profileImage') {
      uploadPath = path.join(UPLOAD_DIR, 'profiles');
    } else if (req.path.includes('/events') && file.fieldname === 'eventImage') {
      uploadPath = path.join(UPLOAD_DIR, 'events');
    } else if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
      uploadPath = path.join(UPLOAD_DIR, 'documents');
    }
    
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9]/g, '_');
    
    cb(null, `${baseName}_${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn('File type not allowed:', {
      filename: file.originalname,
      mimetype: file.mimetype,
      allowedTypes
    });
    cb(createError(
      `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      400,
      'INVALID_FILE_TYPE'
    ));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5 // Maximum 5 files per request
  }
});

// Upload middleware for different scenarios
export const uploadSingle = (fieldName: string) => upload.single(fieldName);
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => upload.array(fieldName, maxCount);
export const uploadFields = (fields: { name: string; maxCount: number }[]) => upload.fields(fields);

/**
 * Process and upload profile image to Cloudinary
 */
export const processProfileImage = async (
  filePath: string,
  userId: string
): Promise<{
  url: string;
  publicId: string;
  variants: any;
}> => {
  try {
    logger.info('Processing profile image:', { filePath, userId });
    
    // Upload to Cloudinary
    const result = await cloudinaryUploadProfile(filePath, userId);
    
    // Generate image variants
    const variants = generateImageVariants(result.public_id);
    
    // Clean up local file
    await deleteFile(filePath);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      variants
    };
  } catch (error) {
    logger.error('Profile image processing failed:', error);
    // Clean up local file on error
    await deleteFile(filePath);
    throw createError('Profile image processing failed', 500, 'IMAGE_PROCESSING_ERROR');
  }
};

/**
 * Process and upload event image to Cloudinary
 */
export const processEventImage = async (
  filePath: string,
  eventId?: string
): Promise<{
  url: string;
  publicId: string;
  variants: any;
}> => {
  try {
    logger.info('Processing event image:', { filePath, eventId });
    
    // Upload to Cloudinary
    const result = await cloudinaryUploadEvent(filePath, eventId);
    
    // Generate image variants
    const variants = generateImageVariants(result.public_id);
    
    // Clean up local file
    await deleteFile(filePath);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      variants
    };
  } catch (error) {
    logger.error('Event image processing failed:', error);
    // Clean up local file on error
    await deleteFile(filePath);
    throw createError('Event image processing failed', 500, 'IMAGE_PROCESSING_ERROR');
  }
};

/**
 * Process and upload document to Cloudinary
 */
export const processDocument = async (
  filePath: string,
  documentName?: string
): Promise<{
  url: string;
  publicId: string;
}> => {
  try {
    logger.info('Processing document:', { filePath, documentName });
    
    // Upload to Cloudinary
    const result = await cloudinaryUploadDocument(filePath, documentName);
    
    // Clean up local file
    await deleteFile(filePath);
    
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    logger.error('Document processing failed:', error);
    // Clean up local file on error
    await deleteFile(filePath);
    throw createError('Document processing failed', 500, 'DOCUMENT_PROCESSING_ERROR');
  }
};

/**
 * Delete uploaded file
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
    logger.info('File deleted:', filePath);
  } catch (error) {
    logger.error('Failed to delete file:', { filePath, error });
    // Don't throw error for file deletion failures
  }
};

/**
 * Delete file from Cloudinary using public ID
 */
export const deleteCloudinaryFile = async (publicId: string): Promise<void> => {
  try {
    await deleteFromCloudinary(publicId);
    logger.info('File deleted from Cloudinary:', publicId);
  } catch (error) {
    logger.error('Failed to delete file from Cloudinary:', { publicId, error });
    throw error;
  }
};

/**
 * Validate file size
 */
export const validateFileSize = (file: Express.Multer.File, maxSize: number = MAX_FILE_SIZE): boolean => {
  return file.size <= maxSize;
};

/**
 * Validate image dimensions (requires image processing library)
 */
export const validateImageDimensions = async (
  filePath: string,
  options: {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  } = {}
): Promise<boolean> => {
  try {
    // For now, just return true
    // In production, you might want to use sharp or similar library
    logger.info('Image dimension validation requested:', { filePath, options });
    return true;
  } catch (error) {
    logger.error('Image dimension validation failed:', error);
    return false;
  }
};

/**
 * Clean up temporary files older than specified time
 */
export const cleanupTempFiles = async (olderThanHours: number = 24): Promise<void> => {
  try {
    const tempDir = path.join(UPLOAD_DIR, 'temp');
    const files = await fs.readdir(tempDir);
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    
    let cleanedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime.getTime() < cutoffTime) {
        await fs.unlink(filePath);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} temporary files`);
    }
  } catch (error) {
    logger.error('Temp file cleanup failed:', error);
  }
};

// Schedule cleanup every 6 hours
setInterval(() => {
  cleanupTempFiles().catch(error => {
    logger.error('Scheduled temp file cleanup failed:', error);
  });
}, 6 * 60 * 60 * 1000);

/**
 * File upload error handler
 */
export const handleUploadError = (error: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return createError(
          `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          400,
          'FILE_TOO_LARGE'
        );
      case 'LIMIT_FILE_COUNT':
        return createError(
          'Too many files uploaded',
          400,
          'TOO_MANY_FILES'
        );
      case 'LIMIT_UNEXPECTED_FILE':
        return createError(
          'Unexpected file field',
          400,
          'UNEXPECTED_FILE'
        );
      default:
        return createError(
          'File upload error',
          400,
          'UPLOAD_ERROR'
        );
    }
  }
  
  return error;
};