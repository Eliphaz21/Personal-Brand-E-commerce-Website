import { Router } from 'express';
import {
  getDashboardOverview,
  getSalesChartData,
  getLowStockProducts,
} from '../controllers/analytics.controller';
import { protect, adminOnly } from '../middlewares/auth.middleware';

const router = Router();

// Protect all analytics routes to Admin only
router.use(protect);
router.use(adminOnly);

router.get('/overview', getDashboardOverview);
router.get('/sales-chart', getSalesChartData);
router.get('/low-stock', getLowStockProducts);

export default router;
