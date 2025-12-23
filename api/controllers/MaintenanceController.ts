import { Request, Response } from "express";
import { db } from "../config/firebase";
import { parsePaginationParams, createPaginatedResponse } from "../utils/types";

export class MaintenanceController {
  /**
   * Submit a new maintenance request
   * @route POST /api/maintenances
   */
  static async submitMaintenance(req: Request, res: Response) {
    const { studentId, title, details } = req.body;

    if (!studentId || !title || !details) {
      return res.status(400).json({
        message: "studentId, title and details are required",
      });
    }

    try {
      // Find user by UNIQUE student_id
      const usersSnap = await db.collection('users').where('student_id', '==', String(studentId)).limit(1).get();

      if (usersSnap.empty) {
        return res.status(404).json({
          message: "Student not found",
        });
      }
      const userDoc = usersSnap.docs[0];
      const userData = userDoc.data();

      const ref = db.collection('maintenances').doc();
      const maintenance = {
        id: ref.id,
        userId: userDoc.id,
        studentName: userData.name, // denormalize for easier fetching
        status: "open",
        title,
        details,
        reply: "",
        created_at: new Date().toISOString()
      };

      await ref.set(maintenance);

      return res.status(201).json({
        message: "Maintenance submitted successfully",
        maintenance,
      });
    } catch (error) {
      console.error("Submit Maintenance Error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  /**
   * Update/resolve a maintenance request (Admin only)
   * @route PUT /api/maintenances/:id
   */
  static async updateMaintenance(req: Request, res: Response) {
    const { id } = req.params;
    const { adminId, reply } = req.body;

    if (!id || !adminId || !reply) {
      return res.status(400).json({
        message: "id, adminId and reply are required",
      });
    }

    try {
      const maintenanceRef = db.collection('maintenances').doc(id);
      const snapshot = await maintenanceRef.get();

      if (!snapshot.exists) {
        return res.status(404).json({ message: "Maintenance not found" });
      }

      await maintenanceRef.update({
        reply,
        adminId: String(adminId),
        status: "resolved",
      });

      const updated = (await maintenanceRef.get()).data();

      return res.status(200).json({
        message: "Maintenance resolved successfully",
        maintenance: { id, ...updated },
      });
    } catch (error) {
      console.error("Update Maintenance Error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  /**
   * Fetch all maintenance requests with optional pagination (Admin)
   * @route GET /api/maintenances?limit=50&offset=0
   * @query limit - Number of items per page (default: 50, max: 100)
   * @query offset - Number of items to skip (default: 0)
   */
  static async fetchAll(req: Request, res: Response) {
    try {
      const { limit, offset } = parsePaginationParams(req.query);
      const usePagination = req.query.limit !== undefined || req.query.offset !== undefined;

      // Get total count
      const countSnapshot = await db.collection('maintenances').count().get();
      const total = countSnapshot.data().count;

      // Fetch with pagination
      let query = db.collection('maintenances').orderBy('created_at', 'desc');

      if (usePagination) {
        query = query.limit(limit).offset(offset);
      }

      const snapshot = await query.get();

      const maintenances = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let studentName = data.studentName;
        let studentId = "Unknown";

        // If denormalized name missing, fetch user
        if (!studentName && data.userId) {
          const userSnap = await db.collection('users').doc(data.userId).get();
          if (userSnap.exists) {
            studentName = userSnap.data()?.name;
            studentId = userSnap.data()?.student_id;
          }
        } else if (data.userId) {
          const userSnap = await db.collection('users').doc(data.userId).get();
          if (userSnap.exists) {
            studentId = userSnap.data()?.student_id;
          }
        }

        return {
          id: doc.id,
          studentName: studentName || "Unknown",
          studentId: studentId,
          title: data.title,
          details: data.details,
          reply: data.reply,
          status: data.status,
          createdAt: data.created_at,
        };
      }));

      // Return paginated or full response
      if (usePagination) {
        return res.status(200).json(createPaginatedResponse(maintenances, total, limit, offset));
      } else {
        return res.status(200).json(maintenances);
      }
    } catch (error) {
      console.error("Fetch Maintenances Error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  /**
   * Fetch maintenance requests by student ID with optional pagination
   * @route GET /api/maintenances/student/:studentId?limit=50&offset=0
   */
  static async fetchByStudent(req: Request, res: Response) {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        message: "studentId is required",
      });
    }

    try {
      const { limit, offset } = parsePaginationParams(req.query);
      const usePagination = req.query.limit !== undefined || req.query.offset !== undefined;

      const usersSnap = await db.collection('users').where('student_id', '==', String(studentId)).limit(1).get();

      if (usersSnap.empty) {
        return res.status(404).json({
          message: "Student not found",
        });
      }

      const userId = usersSnap.docs[0].id;

      // Get total count
      const countSnapshot = await db.collection('maintenances')
        .where('userId', '==', userId)
        .count()
        .get();
      const total = countSnapshot.data().count;

      // Fetch with orderBy and pagination
      let query = db.collection('maintenances')
        .where('userId', '==', userId)
        .orderBy('created_at', 'desc');

      if (usePagination) {
        query = query.limit(limit).offset(offset);
      }

      const snapshot = await query.get();
      const maintenances = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (usePagination) {
        return res.status(200).json(createPaginatedResponse(maintenances, total, limit, offset));
      } else {
        return res.status(200).json(maintenances);
      }
    } catch (error) {
      console.error("Fetch By Student Error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  /**
   * Fetch maintenance requests by user document ID with optional pagination
   * @route GET /api/maintenances/user/:userId?limit=50&offset=0
   */
  static async fetchByUserId(req: Request, res: Response) {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required",
      });
    }

    try {
      const { limit, offset } = parsePaginationParams(req.query);
      const usePagination = req.query.limit !== undefined || req.query.offset !== undefined;

      // Get total count
      const countSnapshot = await db.collection('maintenances')
        .where('userId', '==', userId)
        .count()
        .get();
      const total = countSnapshot.data().count;

      // Fetch with orderBy and pagination
      let query = db.collection('maintenances')
        .where('userId', '==', userId)
        .orderBy('created_at', 'desc');

      if (usePagination) {
        query = query.limit(limit).offset(offset);
      }

      const snapshot = await query.get();
      const maintenances = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (usePagination) {
        return res.status(200).json(createPaginatedResponse(maintenances, total, limit, offset));
      } else {
        return res.status(200).json(maintenances);
      }
    } catch (error) {
      console.error("Fetch By User ID Error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}
