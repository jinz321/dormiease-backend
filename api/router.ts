import express from 'express';

import AdminRoutes from './routes/AdminRoutes';
import UserRoutes from './routes/UserRoutes';
import RoomRoutes from './routes/RoomRoutes';
import ComplaintRoutes from './routes/ComplaintRoutes';
import MaintenanceRoutes from './routes/MaintenanceRoutes';
import HostelRoutes from './routes/HostelRoutes';
import MessagingRoutes from './routes/MessagingRoutes';
import NotificationRoutes from './routes/NotificationRoutes';

const router = express.Router();

router.use('/admin', AdminRoutes);
router.use('/room', RoomRoutes);
router.use('/user', UserRoutes);
router.use('/maintenance', MaintenanceRoutes);
router.use('/complaint', ComplaintRoutes);
router.use('/hostels', HostelRoutes);
router.use('/messaging', MessagingRoutes);
router.use('/notification', NotificationRoutes);

export default router;
