import express from 'express';
import { getDashboardMetrics, getRecentActivities } from '../controllers/dashboardController';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all dashboard routes
router.use(requireAuth);

// Dashboard metrics endpoint
router.get('/metrics', getDashboardMetrics);

// Recent activities endpoint
router.get('/activities', getRecentActivities);

export default router;