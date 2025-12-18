import express from 'express';
import { MessagingController } from "../controllers/MessagingController";

const router = express.Router();

// Start or get conversation
router.post('/conversation/start', MessagingController.startConversation as express.RequestHandler);

// Alias for mobile app compatibility (POST /user/conversations/:user_id with admin_id in body)
router.post('/user/conversations/:user_id', MessagingController.startConversation as express.RequestHandler);

// Sending message
router.post('/message/send', MessagingController.sendMessage as express.RequestHandler);
router.post('/send', MessagingController.sendMessage as express.RequestHandler); // Alias for mobile app

// Conversations list
router.get('/admin/conversations/:admin_id', MessagingController.getAdminConversations as express.RequestHandler);
router.get('/user/conversations/:user_id', MessagingController.getUserConversations as express.RequestHandler);

// Messages in conversation
router.get('/messages/:conversation_id', MessagingController.getMessages as express.RequestHandler);

// Mark read
router.patch('/message/read/:message_id', MessagingController.markAsRead as express.RequestHandler);
export default router;
