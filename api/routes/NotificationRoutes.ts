import express from "express";
import NotificationController from "../controllers/NotificationController";

const router = express.Router();

// Admin
router.post("/create", NotificationController.create as express.RequestHandler);
router.get("/all", NotificationController.adminGetAll as express.RequestHandler);
router.delete("/:id", NotificationController.delete as express.RequestHandler);

// User
router.get("/user/:userId", NotificationController.getForUser as express.RequestHandler);
router.put("/read/:userNotificationId", NotificationController.markAsRead as express.RequestHandler);

// Alias for mobile app compatibility (shorter path)
router.get("/:userId", NotificationController.getForUser as express.RequestHandler);

export default router;
