import express from 'express';
import { ReportController } from '../controllers/ReportController';

const router = express.Router();

// Report routes (Admin only)
router.get('/occupancy', ReportController.getOccupancyReport as express.RequestHandler);
router.get('/payments', ReportController.getPaymentReport as express.RequestHandler);
router.get('/maintenance', ReportController.getMaintenanceReport as express.RequestHandler);
router.get('/complaints', ReportController.getComplaintReport as express.RequestHandler);
router.get('/dashboard', ReportController.getDashboardOverview as express.RequestHandler);

export default router;
