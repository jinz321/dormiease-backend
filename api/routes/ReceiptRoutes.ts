import express from 'express';
import { ReceiptController } from '../controllers/ReceiptController';

const router = express.Router();

// Receipt routes - IMPORTANT: Specific routes must come before parameterized routes
router.get('/:paymentId/html', ReceiptController.getReceiptHTML as express.RequestHandler);
router.get('/:paymentId/download', ReceiptController.downloadReceipt as express.RequestHandler);
router.get('/:paymentId', ReceiptController.getReceiptData as express.RequestHandler);

export default router;
