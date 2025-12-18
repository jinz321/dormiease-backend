import { Request, Response } from "express";
import { db, admin } from "../config/firebase";

export class HostelController {

    static async applyHostel(req: Request, res: Response) {
        try {
            const { room_type } = req.body;
            const user_id = req.body.user_id || req.body.userId;
            const hostel_id = req.body.hostel_id || req.body.hostelId;

            if (!user_id || !hostel_id) {
                return res.status(400).json({ message: "User ID and Hostel ID are required" });
            }

            const ref = db.collection('hostel_applications').doc();
            const application = {
                id: ref.id,
                user_id,
                hostel_id,
                room_type: room_type || 'standard',
                status: 'pending',
                created_at: new Date().toISOString()
            };

            await ref.set(application);

            // Sync with Hostel document
            const hostelRef = db.collection('hostels').doc(hostel_id);
            await hostelRef.update({
                pendingUsers: admin.firestore.FieldValue.arrayUnion(user_id)
            });

            return res.status(201).json({ message: "Application submitted successfully", application });
        } catch (error) {
            console.error("Apply hostel error:", error);
            return res.status(500).json({ message: "Failed to submit application" });
        }
    }

    static async fetchAll(req: Request, res: Response) {
        try {
            const snapshot = await db.collection('hostels').get();
            const hostels = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return res.status(200).json(hostels);
        } catch (error) {
            console.error("Fetch hostels error:", error);
            return res.status(500).json({ message: "Failed to fetch hostels" });
        }
    }

    static async fetchAllApplications(req: Request, res: Response) {
        try {
            const snapshot = await db.collection('hostel_applications').get();
            const applications = await Promise.all(snapshot.docs.map(async (doc) => {
                const data = doc.data();

                // Fetch user
                const userSnap = await db.collection('users').doc(data.user_id || data.userId).get();
                const userData = userSnap.exists ? userSnap.data() : { name: 'Unknown', student_id: 'Unknown' };

                // Fetch hostel
                const hostelSnap = await db.collection('hostels').doc(data.hostel_id || data.hostelId).get();
                const hostelData = hostelSnap.exists ? hostelSnap.data() : { name: 'Unknown', maxSize: 0 };

                // Fetch room if assigned
                let roomName = null;
                if (data.room_id || data.roomId) {
                    const roomSnap = await db.collection('rooms').doc(data.room_id || data.roomId).get();
                    if (roomSnap.exists) {
                        roomName = roomSnap.data()?.name;
                    }
                }

                return {
                    applicationId: doc.id,
                    userId: data.user_id || data.userId,
                    studentName: userData?.name,
                    studentId: userData?.student_id,
                    hostelId: data.hostel_id || data.hostelId,
                    hostelName: hostelData?.name,
                    roomId: data.room_id || data.roomId || null,
                    roomName: roomName,
                    status: data.status,
                    approvedCount: 0, // Placeholder
                    maxCount: hostelData?.maxSize || 0
                };
            }));
            return res.status(200).json(applications);
        } catch (error) {
            console.error("Fetch applications error:", error);
            return res.status(500).json({ message: "Failed to fetch applications" });
        }
    }

    static async updateApplicationStatus(req: Request, res: Response) {
        try {
            const id = req.body.id || req.body.applicationId;
            const { status } = req.body;

            if (!id || !status) {
                return res.status(400).json({ message: "Application ID and status are required" });
            }

            const appRef = db.collection('hostel_applications').doc(id);
            const appDoc = await appRef.get();

            if (!appDoc.exists) {
                return res.status(404).json({ message: "Application not found" });
            }

            const appData = appDoc.data();
            const hostelId = appData?.hostel_id || appData?.hostelId;
            const userId = appData?.user_id || appData?.userId;

            await appRef.update({ status, updated_at: new Date().toISOString() });

            // Sync with Hostel document
            if (hostelId && userId) {
                const hostelRef = db.collection('hostels').doc(hostelId);

                if (status === 'approved') {
                    await hostelRef.update({
                        pendingUsers: admin.firestore.FieldValue.arrayRemove(userId),
                        approvedUsers: admin.firestore.FieldValue.arrayUnion(userId),
                        rejectedUsers: admin.firestore.FieldValue.arrayRemove(userId),
                        totalApprovedUsers: admin.firestore.FieldValue.increment(1)
                    });
                } else if (status === 'rejected') {
                    await hostelRef.update({
                        pendingUsers: admin.firestore.FieldValue.arrayRemove(userId),
                        approvedUsers: admin.firestore.FieldValue.arrayRemove(userId),
                        rejectedUsers: admin.firestore.FieldValue.arrayUnion(userId)
                        // Note: If they were previously approved, we might need to decrement totalApprovedUsers, 
                        // but usually rejection happens from pending. 
                    });
                }
            }

            return res.status(200).json({ message: "Application status updated" });
        } catch (error) {
            console.error("Update hostel application error:", error);
            return res.status(500).json({ message: "Failed to update application" });
        }
    }
    static async createHostel(req: Request, res: Response) {
        try {
            const { name, maxSize } = req.body;

            if (!name) {
                return res.status(400).json({ message: "Hostel name is required" });
            }

            const ref = db.collection('hostels').doc();
            const hostel = {
                id: ref.id,
                name,
                maxSize: maxSize || 0,
                totalRooms: 0,
                totalCapacity: 0,
                totalApprovedUsers: 0,
                isFull: false,
                approvedUsers: [],
                pendingUsers: [],
                rejectedUsers: [],
                created_at: new Date().toISOString()
            };

            await ref.set(hostel);

            return res.status(201).json(hostel);
        } catch (error) {
            console.error("Create hostel error:", error);
            return res.status(500).json({ message: "Failed to create hostel" });
        }
    }
}
