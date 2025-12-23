import { Request, Response } from "express";
import { db } from "../config/firebase";
import { parsePaginationParams, createPaginatedResponse } from "../utils/types";

export default class NotificationController {

  /**
   * Create a new notification and fan-out to all users
   * @route POST /api/notifications
   */
  static async create(req: Request, res: Response): Promise<void> {
    const { title, message } = req.body;

    if (!title) {
      res.status(400).json({ message: "title is required" });
      return;
    }

    if (!message) {
      res.status(400).json({ message: "message is required" });
      return;
    }

    try {
      const notifRef = db.collection('notifications').doc();
      const notification = {
        id: notifRef.id,
        title,
        message,
        created_at: new Date().toISOString()
      };
      await notifRef.set(notification);

      // Fan-out to all users
      const usersSnap = await db.collection('users').get();

      const batch = db.batch();

      usersSnap.forEach(userDoc => {
        const ref = db.collection('user_notifications').doc();
        batch.set(ref, {
          id: ref.id,
          user_id: userDoc.id,
          notification_id: notifRef.id,
          is_read: false,
          created_at: new Date().toISOString()
        });
      });

      await batch.commit();

      res.status(201).json(notification);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  }

  /**
   * Delete a notification
   * @route DELETE /api/notifications/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    const notifId = req.params.id;
    if (!notifId) {
      res.status(400).json({ message: "Invalid notification id" });
      return;
    }

    try {
      // Find user_notifications to delete
      const userNotifsSnap = await db.collection('user_notifications').where('notification_id', '==', notifId).get();

      const batch = db.batch();
      userNotifsSnap.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      batch.delete(db.collection('notifications').doc(notifId));

      await batch.commit();

      res.status(200).json({ message: "Deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  }

  /**
   * Get all notifications (Admin)
   * @route GET /api/admin/notifications
   */
  static async adminGetAll(req: Request, res: Response): Promise<void> {
    try {
      const snapshot = await db.collection('notifications').orderBy('created_at', 'desc').get();
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      res.status(200).json(notifications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  }

  /**
   * Get notifications for a specific user with optional pagination
   * @route GET /api/notifications/user/:userId?limit=50&offset=0
   * @query limit - Number of items per page (default: 50, max: 100)
   * @query offset - Number of items to skip (default: 0)
   */
  static async getForUser(req: Request, res: Response): Promise<void> {
    const userId = req.params.userId;
    if (!userId) {
      res.status(400).json({ message: "Invalid user id" });
      return;
    }

    try {
      const { limit, offset } = parsePaginationParams(req.query);
      const usePagination = req.query.limit !== undefined || req.query.offset !== undefined;

      // Get total count
      const countSnapshot = await db.collection('user_notifications')
        .where('user_id', '==', userId)
        .count()
        .get();
      const total = countSnapshot.data().count;

      // If no notifications, return empty array
      if (total === 0) {
        if (usePagination) {
          res.status(200).json(createPaginatedResponse([], 0, limit, offset));
        } else {
          res.status(200).json([]);
        }
        return;
      }

      // Fetch with orderBy and pagination
      let query = db.collection('user_notifications')
        .where('user_id', '==', userId)
        .orderBy('created_at', 'desc');

      if (usePagination) {
        query = query.limit(limit).offset(offset);
      }

      const snapshot = await query.get();

      // Manual join with notification details
      const userNotifs = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const notifSnap = await db.collection('notifications').doc(data.notification_id).get();
        return {
          id: doc.id,
          ...data,
          notification: notifSnap.exists ? notifSnap.data() : null
        };
      }));

      if (usePagination) {
        res.status(200).json(createPaginatedResponse(userNotifs, total, limit, offset));
      } else {
        res.status(200).json(userNotifs);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch user notifications" });
    }
  }

  /**
   * Mark a notification as read
   * @route PUT /api/notifications/:userNotificationId/read
   */
  static async markAsRead(req: Request, res: Response): Promise<void> {
    const id = req.params.userNotificationId;
    if (!id) {
      res.status(400).json({ message: "Invalid notification id" });
      return;
    }

    try {
      await db.collection('user_notifications').doc(id).update({
        is_read: true,
        read_at: new Date().toISOString()
      });

      res.status(200).json({ id, is_read: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update read status" });
    }
  }
}
