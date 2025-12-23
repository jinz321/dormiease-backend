import express from 'express';
import { AdminController } from '../controllers/AdminController';
import { RoomController } from '../controllers/RoomController';
import { ComplaintController } from '../controllers/ComplaintController';
import { HostelController } from '../controllers/HostelController';
import { MaintenanceController } from '../controllers/MaintenanceController';
import NotificationController from '../controllers/NotificationController';
import { UserController } from '../controllers/UserController';

const router = express.Router();

router.post('/signin', AdminController.signin as express.RequestHandler);
router.post('/signup', AdminController.signup as express.RequestHandler);
router.get('/all-users', UserController.getAllUsers as express.RequestHandler);
router.get('/all-admins', UserController.getAllAdmins as express.RequestHandler);
router.post('/submit-complaint', ComplaintController.submitComplaint as express.RequestHandler);
router.post('/submit-maintenance', MaintenanceController.submitMaintenance as express.RequestHandler);
router.put('/update-hostel-application', HostelController.updateApplicationStatus as express.RequestHandler);
router.put('/change-room', RoomController.changeRoom as express.RequestHandler);
router.put('/update-application/:id', RoomController.updateApplicationStatus as express.RequestHandler);
router.put('/update-complaint/:id', ComplaintController.updateComplaint as express.RequestHandler);
router.delete('/delete-complaint/:id', ComplaintController.deleteComplaint as express.RequestHandler);
router.put('/update-maintenance/:id', MaintenanceController.updateMaintenance as express.RequestHandler);
router.post('/create-notification', NotificationController.create as express.RequestHandler);
// DEBUG ROUTES
router.get('/debug/admins', AdminController.listAdmins as express.RequestHandler);

export default router;
