import express from 'express';
import { HostelController } from '../controllers/HostelController';

const router = express.Router();

router.post('/apply', HostelController.applyHostel as express.RequestHandler);
router.get('/all', HostelController.fetchAll as express.RequestHandler);
router.post('/create', HostelController.createHostel as express.RequestHandler);
router.get('/all-applications', HostelController.fetchAllApplications as express.RequestHandler);
router.get('/user-application/:userId', HostelController.getUserApplication as express.RequestHandler);
router.put('/update-dates', HostelController.updateHostelDates as express.RequestHandler);

export default router;
