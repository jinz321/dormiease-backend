import express from 'express';
import { RoomController } from '../controllers/RoomController';

const router = express.Router();

// router.post('/create', RoomController.create); // Admin uses this potentially, but check controller
router.post('/create', RoomController.create as express.RequestHandler);
router.get('/all', RoomController.fetchAll as express.RequestHandler);
router.get('/all-applications', RoomController.getRoomApplications as express.RequestHandler);

export default router;
