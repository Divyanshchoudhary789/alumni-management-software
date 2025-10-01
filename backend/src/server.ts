// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { connectDatabase } from './config/database';
import { logger } from './config/logger';
import { setupSwagger } from './config/swagger';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter, securityHeaders, sanitizeInput, getCorsOptions } from './middleware/security';
import webhookRoutes from './routes/webhooks';
import authRoutes from './routes/auth';
import alumniRoutes from './routes/alumni';
import eventsRoutes from './routes/events';
import communicationsRoutes from './routes/communications';
import donationsRoutes from './routes/donations';
import mentorshipRoutes from './routes/mentorship';
import dashboardRoutes from './routes/dashboard';
import uploadRoutes from './routes/upload';

// Environment variables already loaded at the top

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Swagger UI
  crossOriginEmbedderPolicy: false
}));
app.use(securityHeaders);

// CORS configuration
app.use(cors(getCorsOptions()));

// Request sanitization
app.use(sanitizeInput);

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Test search endpoint
app.get('/test-search', async (req, res) => {
  try {
    const { search } = req.query;
    const { AlumniProfile } = await import('./models/AlumniProfile');
    
    const query: any = {};
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { currentCompany: searchRegex }
      ];
    }
    
    const results = await AlumniProfile.find(query).limit(5);
    res.json({ search, query, results: results.length, data: results });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Setup API documentation
setupSwagger(app);

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Alumni Management API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    documentation: '/api-docs'
  });
});

// Webhook routes (must be before other body parsing middleware for raw body)
app.use('/api/webhooks', webhookRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Core functionality routes
app.use('/api/alumni', alumniRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/communications', communicationsRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler for API routes
app.use('/api/*', notFoundHandler);

// Global error handling middleware
app.use(globalErrorHandler);

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

export default app;