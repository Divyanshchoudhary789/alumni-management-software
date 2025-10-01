import { apiClient } from '@/lib/api';

export interface UploadResponse {
  message: string;
  url: string;
  publicId: string;
  variants?: {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    original: string;
  };
  fileName: string;
}

export interface DocumentUploadResponse {
  message: string;
  files: Array<{
    fileName: string;
    originalName: string;
    url: string;
    publicId: string;
    size: number;
    mimeType: string;
  }>;
}

export interface UploadSignature {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
  public_id?: string;
}

class UploadApiService {
  // Upload profile image
  async uploadProfileImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('profileImage', file);

    return apiClient.upload<UploadResponse>('/upload/profile-image', formData);
  }

  // Upload event image (admin only)
  async uploadEventImage(
    file: File,
    eventId?: string
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('eventImage', file);

    if (eventId) {
      formData.append('eventId', eventId);
    }

    return apiClient.upload<UploadResponse>('/upload/event-image', formData);
  }

  // Upload documents (admin only)
  async uploadDocuments(files: File[]): Promise<DocumentUploadResponse> {
    const formData = new FormData();

    files.forEach(file => {
      formData.append('documents', file);
    });

    return apiClient.upload<DocumentUploadResponse>(
      '/upload/documents',
      formData
    );
  }

  // Delete uploaded file (admin only)
  async deleteFile(publicId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>('/upload/delete', {
      publicId,
    });
  }

  // Get upload signature for direct uploads
  async getUploadSignature(
    folder: 'profiles' | 'events' | 'documents',
    publicId?: string
  ): Promise<UploadSignature> {
    return apiClient.post<UploadSignature>('/upload/signature', {
      folder,
      publicId,
    });
  }

  // Direct upload to Cloudinary (using signature)
  async directUpload(file: File, signature: UploadSignature): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature.signature);
    formData.append('timestamp', signature.timestamp.toString());
    formData.append('api_key', signature.api_key);
    formData.append('folder', signature.folder);

    if (signature.public_id) {
      formData.append('public_id', signature.public_id);
    }

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signature.cloud_name}/image/upload`;

    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Validate file before upload
  validateFile(
    file: File,
    options: {
      maxSize?: number; // in bytes
      allowedTypes?: string[];
    } = {}
  ): { valid: boolean; error?: string } {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    } = options;

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    return { valid: true };
  }

  // Get optimized image URL from Cloudinary
  getOptimizedImageUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
      format?: string;
    } = {}
  ): string {
    const {
      width,
      height,
      crop = 'fill',
      quality = 'auto:good',
      format = 'auto',
    } = options;

    const cloudName = 'duxpzyvdi'; // Your Cloudinary cloud name
    const transformations = [];

    if (width || height) {
      let sizeTransform = '';
      if (width) sizeTransform += `w_${width}`;
      if (height) sizeTransform += `,h_${height}`;
      if (crop) sizeTransform += `,c_${crop}`;
      transformations.push(sizeTransform);
    }

    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);

    const transformString =
      transformations.length > 0 ? `/${transformations.join('/')}/` : '/';

    return `https://res.cloudinary.com/${cloudName}/image/upload${transformString}${publicId}`;
  }
}

export const uploadApiService = new UploadApiService();
