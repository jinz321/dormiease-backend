import express from 'express';
import { ComplaintController } from '../controllers/ComplaintController';

const router = express.Router();

router.get('/all', ComplaintController.fetchAll as express.RequestHandler);
router.get('/:userId', ComplaintController.fetchByStudent as express.RequestHandler);

// ✅ ADD THIS
router.post('/submit', ComplaintController.submitComplaint as express.RequestHandler);

export default router;
