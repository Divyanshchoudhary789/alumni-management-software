import express from 'express';
import { 
  getDashboardMetrics, 
  getRecentActivities,
  getAlumniGrowthData,
  getEventAttendanceData,
  getDonationTrendsData
} from '../controllers/dashboardController';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all dashboard routes
router.use(requireAuth);

// Dashboard metrics endpoint
router.get('/metrics', getDashboardMetrics);

// Recent activities endpoint
router.get('/activities', getRecentActivities);

// Chart data endpoints
router.get('/charts/alumni-growth', getAlumniGrowthData);
router.get('/charts/event-attendance', getEventAttendanceData);
router.get('/charts/donation-trends', getDonationTrendsData);

export default router;