import express from 'express';
import { PaymentController } from '../controllers/PaymentController';

const router = express.Router();

// Admin routes
router.post('/create', PaymentController.createPayment as express.RequestHandler);
router.get('/all', PaymentController.getAllPayments as express.RequestHandler);
router.get('/stats', PaymentController.getPaymentStats as express.RequestHandler);
router.put('/update/:id', PaymentController.updatePayment as express.RequestHandler);
router.delete('/:id', PaymentController.deletePayment as express.RequestHandler);

// User routes
router.get('/user/:userId', PaymentController.getUserPayments as express.RequestHandler);
router.post('/process/:id', PaymentController.processPayment as express.RequestHandler);

export default router;
