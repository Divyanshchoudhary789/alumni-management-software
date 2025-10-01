import express, { Request, Response } from 'express';
import { authenticatedRoute, adminRoute } from '../middleware/auth';
import { uploadLimiter } from '../middleware/security';
import { 
  uploadSingle, 
  uploadMultiple, 
  processProfileImage,
  processEventImage,
  processDocument,
  handleUploadError,
  validateFileSize,
  deleteFile,
  deleteCloudinaryFile
} from '../services/uploadService';
import { logger } from '../config/logger';
import { createError } from '../middleware/errorHandler';
import { getUploadSignature } from '../services/cloudinaryService';

const router = express.Router();

/**
 * @swagger
 * /api/upload/profile-image:
 *   post:
 *     summary: Upload profile image
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (JPEG, PNG, WebP)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 fileUrl:
 *                   type: string
 *                   format: uri
 *                 fileName:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/profile-image', 
  authenticatedRoute,
  uploadLimiter,
  (req: Request, res: Response): void => {
    const upload = uploadSingle('profileImage');
    
    upload(req, res, async (err): Promise<void> => {
      try {
        if (err) {
          const error = handleUploadError(err);
          res.status(error.statusCode || 400).json({
            error: {
              message: error.message,
              code: error.code
            }
          });
          return;
        }

        if (!req.file) {
          res.status(400).json({
            error: {
              message: 'No file uploaded',
              code: 'NO_FILE'
            }
          });
          return;
        }

        // Validate file size (additional check)
        if (!validateFileSize(req.file)) {
          await deleteFile(req.file.path);
          res.status(400).json({
            error: {
              message: 'File size too large',
              code: 'FILE_TOO_LARGE'
            }
          });
          return;
        }

        // Process and upload to Cloudinary
        const result = await processProfileImage(req.file.path, String(req.user!._id));

        logger.info('Profile image uploaded successfully', {
          userId: req.user!._id,
          fileName: req.file.filename,
          fileSize: req.file.size,
          cloudinaryUrl: result.url,
          publicId: result.publicId
        });

        res.json({
          message: 'Profile image uploaded successfully',
          url: result.url,
          publicId: result.publicId,
          variants: result.variants,
          fileName: req.file.filename
        });

      } catch (error) {
        logger.error('Profile image upload error:', error);
        
        // Clean up file if processing failed
        if (req.file) {
          await deleteFile(req.file.path);
        }

        res.status(500).json({
          error: {
            message: 'Failed to process uploaded image',
            code: 'PROCESSING_ERROR'
          }
        });
      }
    });
  }
);

/**
 * @swagger
 * /api/upload/event-image:
 *   post:
 *     summary: Upload event image
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               eventImage:
 *                 type: string
 *                 format: binary
 *                 description: Event image file (JPEG, PNG, WebP)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/event-image',
  adminRoute,
  uploadLimiter,
  (req: Request, res: Response): void => {
    const upload = uploadSingle('eventImage');
    
    upload(req, res, async (err): Promise<void> => {
      try {
        if (err) {
          const error = handleUploadError(err);
          res.status(error.statusCode || 400).json({
            error: {
              message: error.message,
              code: error.code
            }
          });
          return;
        }

        if (!req.file) {
          res.status(400).json({
            error: {
              message: 'No file uploaded',
              code: 'NO_FILE'
            }
          });
          return;
        }

        // Process and upload to Cloudinary
        const eventId = req.body.eventId; // Optional event ID
        const result = await processEventImage(req.file.path, eventId);

        logger.info('Event image uploaded successfully', {
          userId: req.user!._id,
          fileName: req.file.filename,
          fileSize: req.file.size,
          cloudinaryUrl: result.url,
          publicId: result.publicId
        });

        res.json({
          message: 'Event image uploaded successfully',
          url: result.url,
          publicId: result.publicId,
          variants: result.variants,
          fileName: req.file.filename
        });

      } catch (error) {
        logger.error('Event image upload error:', error);
        
        // Clean up file if processing failed
        if (req.file) {
          await deleteFile(req.file.path);
        }

        res.status(500).json({
          error: {
            message: 'Failed to process uploaded image',
            code: 'PROCESSING_ERROR'
          }
        });
      }
    });
  }
);

/**
 * @swagger
 * /api/upload/documents:
 *   post:
 *     summary: Upload multiple documents
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Document files (PDF, DOC, DOCX)
 *     responses:
 *       200:
 *         description: Documents uploaded successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/documents',
  adminRoute,
  uploadLimiter,
  (req: Request, res: Response): void => {
    const upload = uploadMultiple('documents', 5);
    
    upload(req, res, async (err): Promise<void> => {
      try {
        if (err) {
          const error = handleUploadError(err);
          res.status(error.statusCode || 400).json({
            error: {
              message: error.message,
              code: error.code
            }
          });
          return;
        }

        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
          res.status(400).json({
            error: {
              message: 'No files uploaded',
              code: 'NO_FILES'
            }
          });
          return;
        }

        // Process each document and upload to Cloudinary
        const uploadedFiles = [];
        
        for (const file of req.files) {
          const result = await processDocument(file.path, file.originalname);
          uploadedFiles.push({
            fileName: file.filename,
            originalName: file.originalname,
            url: result.url,
            publicId: result.publicId,
            size: file.size,
            mimeType: file.mimetype
          });
        }

        logger.info('Documents uploaded successfully', {
          userId: req.user!._id,
          fileCount: req.files.length,
          files: uploadedFiles.map(f => f.fileName)
        });

        res.json({
          message: 'Documents uploaded successfully',
          files: uploadedFiles
        });

      } catch (error) {
        logger.error('Document upload error:', error);
        
        // Clean up files if processing failed
        if (req.files && Array.isArray(req.files)) {
          for (const file of req.files) {
            await deleteFile(file.path);
          }
        }

        res.status(500).json({
          error: {
            message: 'Failed to process uploaded documents',
            code: 'PROCESSING_ERROR'
          }
        });
      }
    });
  }
);

/**
 * @swagger
 * /api/upload/delete:
 *   delete:
 *     summary: Delete uploaded file from Cloudinary
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicId:
 *                 type: string
 *                 description: Cloudinary public ID of the file to delete
 *             required:
 *               - publicId
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: File not found
 */
router.delete('/delete',
  adminRoute,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { publicId } = req.body;

      if (!publicId) {
        res.status(400).json({
          error: {
            message: 'Public ID is required',
            code: 'MISSING_PUBLIC_ID'
          }
        });
        return;
      }

      // Security check: ensure public ID belongs to our app
      if (!publicId.startsWith('alumni-management/')) {
        res.status(400).json({
          error: {
            message: 'Invalid public ID',
            code: 'INVALID_PUBLIC_ID'
          }
        });
        return;
      }

      // Delete from Cloudinary
      await deleteCloudinaryFile(publicId);

      logger.info('File deleted successfully from Cloudinary', {
        userId: req.user!._id,
        publicId
      });

      res.json({
        message: 'File deleted successfully'
      });

    } catch (error) {
      logger.error('File deletion error:', error);
      res.status(500).json({
        error: {
          message: 'Failed to delete file',
          code: 'DELETION_ERROR'
        }
      });
    }
  }
);

/**
 * @swagger
 * /api/upload/signature:
 *   post:
 *     summary: Get upload signature for direct Cloudinary uploads
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               folder:
 *                 type: string
 *                 description: Upload folder (profiles, events, documents)
 *                 enum: [profiles, events, documents]
 *               publicId:
 *                 type: string
 *                 description: Optional custom public ID
 *             required:
 *               - folder
 *     responses:
 *       200:
 *         description: Upload signature generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 signature:
 *                   type: string
 *                 timestamp:
 *                   type: number
 *                 api_key:
 *                   type: string
 *                 cloud_name:
 *                   type: string
 *                 folder:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/signature',
  authenticatedRoute,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { folder, publicId } = req.body;

      if (!folder) {
        res.status(400).json({
          error: {
            message: 'Folder is required',
            code: 'MISSING_FOLDER'
          }
        });
        return;
      }

      // Validate folder
      const allowedFolders = ['profiles', 'events', 'documents'];
      if (!allowedFolders.includes(folder)) {
        res.status(400).json({
          error: {
            message: 'Invalid folder. Allowed: profiles, events, documents',
            code: 'INVALID_FOLDER'
          }
        });
        return;
      }

      // Generate signature
      const fullFolder = `alumni-management/${folder}`;
      const signature = getUploadSignature(fullFolder, publicId);

      logger.info('Upload signature generated', {
        userId: req.user!._id,
        folder: fullFolder,
        publicId
      });

      res.json(signature);

    } catch (error) {
      logger.error('Signature generation error:', error);
      res.status(500).json({
        error: {
          message: 'Failed to generate upload signature',
          code: 'SIGNATURE_ERROR'
        }
      });
    }
  }
);

export default router;