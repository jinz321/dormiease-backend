import { Request, Response } from "express";
import { db } from "../config/firebase";

export class MaintenanceController {
  // ===============================
  // SUBMIT MAINTENANCE
  // ===============================
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

  // ===============================
  // RESOLVE MAINTENANCE (ADMIN)
  // ===============================
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

  // ===============================
  // FETCH ALL MAINTENANCES (ADMIN)
  // ===============================
  static async fetchAll(req: Request, res: Response) {
    try {
      const snapshot = await db.collection('maintenances')
        .orderBy('created_at', 'desc')
        .get();

      const maintenances = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let studentName = data.studentName;
        let studentId = "Unknown";

        // If denormalized name missing, fetch user. 
        // Can be optimized by denormalizing fully.
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

      return res.status(200).json(maintenances);
    } catch (error) {
      console.error("Fetch Maintenances Error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  // ===============================
  // FETCH MAINTENANCE BY STUDENT ID
  // ===============================
  static async fetchByStudent(req: Request, res: Response) {
    const { studentId } = req.params; // Note: params might pass userId (PK) or studentId (string field). Code assumes studentId field.

    if (!studentId) {
      return res.status(400).json({
        message: "studentId is required",
      });
    }

    try {
      // Assuming params passes the 'student_id' string (e.g. S12345) based on original code `where: { student_id: String(studentId) }`
      // Or does it pass the database ID? Original code query `prisma.users.findUnique({ where: { student_id: String(studentId) } })` suggests it's the student ID string.

      const usersSnap = await db.collection('users').where('student_id', '==', String(studentId)).limit(1).get();

      if (usersSnap.empty) {
        return res.status(404).json({
          message: "Student not found",
        });
      }

      const userId = usersSnap.docs[0].id;

      const snapshot = await db.collection('maintenances')
        .where('userId', '==', userId)
        // .orderBy('created_at', 'desc') // Requires index
        .get();

      // Manual sort in memory to avoid index error for now
      interface MaintenanceData {
        id: string;
        created_at?: string;
        [key: string]: unknown;
      }
      const maintenances = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceData))
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

      return res.status(200).json(maintenances);
    } catch (error) {
      console.error("Fetch By Student Error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  // ===============================
  // FETCH MAINTENANCE BY USER ID (DOCUMENT ID)
  // ===============================
  static async fetchByUserId(req: Request, res: Response) {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required",
      });
    }

    try {
      const snapshot = await db.collection('maintenances')
        .where('userId', '==', userId)
        .get();

      interface MaintenanceData {
        id: string;
        created_at?: string;
        [key: string]: unknown;
      }

      const maintenances = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceData))
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

      return res.status(200).json(maintenances);
    } catch (error) {
      console.error("Fetch By User ID Error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}
