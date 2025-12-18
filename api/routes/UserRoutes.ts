import express from 'express';
import { UserController } from '../controllers/UserController';
import { RoomController } from '../controllers/RoomController';
import { ComplaintController } from '../controllers/ComplaintController';
import { HostelController } from '../controllers/HostelController';
import { MaintenanceController } from '../controllers/MaintenanceController';
import NotificationController from '../controllers/NotificationController';

const router = express.Router();

router.post('/signin', UserController.signin as express.RequestHandler);
router.post('/signup', UserController.signup as express.RequestHandler);
router.post('/update-profile', UserController.updateProfile as express.RequestHandler);
router.get('/all-admins', UserController.getAllAdmins as express.RequestHandler);
router.post('/apply-room', RoomController.applyToRoom as express.RequestHandler);
router.post('/apply-hostel', HostelController.applyHostel as express.RequestHandler);
router.post('/submit-complaint', ComplaintController.submitComplaint as express.RequestHandler);
router.post('/submit-maintenance', MaintenanceController.submitMaintenance as express.RequestHandler);
router.get('/notifications/:userId', NotificationController.getForUser as express.RequestHandler);
router.post('/update-notification/:userNotificationId', NotificationController.markAsRead as express.RequestHandler)

export default router;
