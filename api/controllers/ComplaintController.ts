import { Request, Response } from "express";
import { db } from "../config/firebase";
import { parsePaginationParams, createPaginatedResponse } from "../utils/types";

export class ComplaintController {

    /**
     * Submit a new complaint
     * @route POST /api/complaints
     */
    static async submitComplaint(req: Request, res: Response) {
        try {
            const { userId, title, details } = req.body;

            if (!userId || !title || !details) {
                return res.status(400).json({ message: "userId, title and details are required" });
            }

            // userId from frontend is often the student_id string
            const usersSnap = await db.collection('users').where('student_id', '==', String(userId)).limit(1).get();
            let studentName = "Unknown";
            let realUserId = userId;
            let studentId = userId;

            if (!usersSnap.empty) {
                const userDoc = usersSnap.docs[0];
                const userData = userDoc.data();
                studentName = userData.name;
                studentId = userData.student_id;
                realUserId = userDoc.id;
            } else {
                // Try fetching by doc ID if student_id match failed
                const userDoc = await db.collection('users').doc(userId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    studentName = userData?.name || "Unknown";
                    studentId = userData?.student_id || userId;
                    realUserId = userDoc.id;
                }
            }

            const ref = db.collection('complaints').doc();
            const complaint = {
                id: ref.id,
                userId: realUserId,
                studentId,
                studentName,
                title,
                details,
                status: 'open',
                reply: '',
                created_at: new Date().toISOString()
            };

            await ref.set(complaint);

            return res.status(201).json({ message: "Complaint submitted successfully", complaint });
        } catch (error) {
            console.error("Submit complaint error:", error);
            return res.status(500).json({ message: "Failed to submit complaint" });
        }
    }

    /**
     * Update a complaint (Admin only)
     * @route PUT /api/complaints/:id
     */
    static async updateComplaint(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status, reply } = req.body;

            if (!id) {
                return res.status(400).json({ message: "Complaint ID is required" });
            }

            const ref = db.collection('complaints').doc(id);
            const doc = await ref.get();

            if (!doc.exists) {
                return res.status(404).json({ message: "Complaint not found" });
            }

            const updates: Record<string, string> = {};
            if (status) updates.status = status;
            if (reply !== undefined) updates.reply = reply;
            updates.updated_at = new Date().toISOString();

            await ref.update(updates);

            return res.status(200).json({ message: "Complaint updated successfully" });
        } catch (error) {
            console.error("Update complaint error:", error);
            return res.status(500).json({ message: "Failed to update complaint" });
        }
    }

    /**
     * Fetch all complaints with optional pagination (Admin)
     * @route GET /api/complaints?limit=50&offset=0
     * @query limit - Number of items per page (default: 50, max: 100)
     * @query offset - Number of items to skip (default: 0)
     */
    static async fetchAll(req: Request, res: Response) {
        try {
            const { limit, offset } = parsePaginationParams(req.query);
            const usePagination = req.query.limit !== undefined || req.query.offset !== undefined;

            // Get total count
            const countSnapshot = await db.collection('complaints').count().get();
            const total = countSnapshot.data().count;

            // Fetch with pagination
            let query = db.collection('complaints').orderBy('created_at', 'desc');

            if (usePagination) {
                query = query.limit(limit).offset(offset);
            }

            const snapshot = await query.get();
            const complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (usePagination) {
                return res.status(200).json(createPaginatedResponse(complaints, total, limit, offset));
            } else {
                return res.status(200).json(complaints);
            }
        } catch (error) {
            console.error("Fetch complaints error:", error);
            return res.status(500).json({ message: "Failed to fetch complaints" });
        }
    }

    /**
     * Fetch complaints by student user ID
     * @route GET /api/complaints/student/:userId
     */
    static async fetchByStudent(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const snapshot = await db.collection('complaints').where('userId', '==', userId).get();
            const complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return res.status(200).json(complaints);
        } catch (error) {
            console.error("Fetch student complaints error:", error);
            return res.status(500).json({ message: "Failed to fetch complaints" });
        }
    }

    /**
     * Delete a complaint (Admin only)
     * @route DELETE /api/complaints/:id
     */
    static async deleteComplaint(req: Request, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: "Complaint ID is required" });
            }

            const ref = db.collection('complaints').doc(id);
            const doc = await ref.get();

            if (!doc.exists) {
                return res.status(404).json({ message: "Complaint not found" });
            }

            await ref.delete();

            return res.status(200).json({ message: "Complaint deleted successfully" });
        } catch (error) {
            console.error("Delete complaint error:", error);
            return res.status(500).json({ message: "Failed to delete complaint" });
        }
    }
}
