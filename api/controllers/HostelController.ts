import { Request, Response } from "express";
import { db, admin } from "../config/firebase";

export class HostelController {

    /**
     * Apply for hostel accommodation
     * @route POST /api/hostels/apply
     */
    static async applyHostel(req: Request, res: Response) {
        try {
            const { room_type } = req.body;
            const user_id = req.body.user_id || req.body.userId;
            const hostel_id = req.body.hostel_id || req.body.hostelId;

            if (!user_id || !hostel_id) {
                return res.status(400).json({ message: "User ID and Hostel ID are required" });
            }

            // Check if user already has an application
            const existingAppSnapshot = await db.collection('hostel_applications')
                .where('user_id', '==', user_id)
                .limit(1)
                .get();

            if (!existingAppSnapshot.empty) {
                const existingApp = existingAppSnapshot.docs[0].data();
                return res.status(400).json({
                    message: "You already have an active hostel application",
                    existingApplication: {
                        id: existingAppSnapshot.docs[0].id,
                        status: existingApp.status,
                        hostel_id: existingApp.hostel_id
                    }
                });
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

    /**
     * Fetch all hostels
     * @route GET /api/hostels
     */
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

    /**
     * Fetch all hostel applications with user and hostel details (Admin)
     * @route GET /api/hostels/applications
     */
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

    /**
     * Update hostel application status (approve/reject)
     * @route PUT /api/hostels/applications/status
     */
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

    /**
     * Create a new hostel
     * @route POST /api/hostels
     */
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

    /**
     * Get user's hostel application
     * @route GET /api/hostels/user-application/:userId
     */
    static async getUserApplication(req: Request, res: Response) {
        try {
            const { userId } = req.params;

            console.log('getUserApplication called with userId:', userId);

            if (!userId) {
                return res.status(400).json({ message: "User ID is required" });
            }

            // Find user's hostel application - check both user_id and userId fields
            console.log('Querying hostel_applications for user_id:', userId);
            let snapshot = await db.collection('hostel_applications')
                .where('user_id', '==', userId)
                .limit(1)
                .get();

            // If not found with user_id, try userId field
            if (snapshot.empty) {
                console.log('Not found with user_id, trying userId field...');
                snapshot = await db.collection('hostel_applications')
                    .where('userId', '==', userId)
                    .limit(1)
                    .get();
            }

            console.log('Query result - empty?', snapshot.empty);
            console.log('Number of docs found:', snapshot.docs.length);

            if (snapshot.empty) {
                return res.status(404).json({ message: "No application found" });
            }

            const appDoc = snapshot.docs[0];
            const appData = appDoc.data();
            console.log('Application data:', appData);

            // Fetch hostel details
            const hostelSnap = await db.collection('hostels').doc(appData.hostel_id || appData.hostelId).get();
            const hostelData = hostelSnap.exists ? hostelSnap.data() : null;

            // Fetch room details if assigned
            let roomData = null;
            if (appData.room_id || appData.roomId) {
                const roomSnap = await db.collection('rooms').doc(appData.room_id || appData.roomId).get();
                if (roomSnap.exists) {
                    roomData = roomSnap.data();
                }
            }

            return res.status(200).json({
                applicationId: appDoc.id,
                hostelName: hostelData?.name || null,
                hostelId: appData.hostel_id || appData.hostelId,
                roomName: roomData?.name || null,
                roomId: appData.room_id || appData.roomId || null,
                status: appData.status,
                moveInDate: hostelData?.moveInDate || null,
                moveOutDate: hostelData?.moveOutDate || null,
                created_at: appData.created_at
            });
        } catch (error) {
            console.error("Get user application error:", error);
            return res.status(500).json({ message: "Failed to fetch application" });
        }
    }

    /**
     * Update hostel move-in and move-out dates
     * @route PUT /api/hostels/update-dates
     */
    static async updateHostelDates(req: Request, res: Response) {
        try {
            const { hostelId, moveInDate, moveOutDate } = req.body;

            if (!hostelId) {
                return res.status(400).json({ message: "Hostel ID is required" });
            }

            const hostelRef = db.collection('hostels').doc(hostelId);
            const hostelDoc = await hostelRef.get();

            if (!hostelDoc.exists) {
                return res.status(404).json({ message: "Hostel not found" });
            }

            const updateData: any = {};
            if (moveInDate) updateData.moveInDate = moveInDate;
            if (moveOutDate) updateData.moveOutDate = moveOutDate;

            await hostelRef.update(updateData);

            const updatedDoc = await hostelRef.get();
            return res.status(200).json({
                message: "Hostel dates updated successfully",
                hostel: { id: updatedDoc.id, ...updatedDoc.data() }
            });
        } catch (error) {
            console.error("Update hostel dates error:", error);
            return res.status(500).json({ message: "Failed to update hostel dates" });
        }
    }
}
