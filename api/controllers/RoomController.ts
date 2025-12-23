import { Request, Response } from "express";
import { db, admin } from "../config/firebase";

export class RoomController {

    /**
     * Apply for a specific room
     * @route POST /api/rooms/apply
     */
    static async applyToRoom(req: Request, res: Response) {
        try {
            const { userId, roomId } = req.body;

            if (!userId || !roomId) {
                return res.status(400).json({ message: "userId and roomId are required" });
            }

            const ref = db.collection('room_applications').doc();
            const application = {
                id: ref.id,
                userId,
                roomId,
                status: 'pending',
                created_at: new Date().toISOString()
            };

            await ref.set(application);

            return res.status(201).json({ message: "Room application submitted", application });
        } catch (error) {
            console.error("Apply room error:", error);
            return res.status(500).json({ message: "Failed to apply for room" });
        }
    }

    /**
     * Change user's room assignment
     * @route PUT /api/rooms/change
     */
    static async changeRoom(req: Request, res: Response) {
        try {
            const { userId, newRoomId, applicationId } = req.body;

            if (!newRoomId) {
                return res.status(400).json({ message: "newRoomId is required" });
            }

            let targetUserId = userId;
            let currentRoomId: string | null = null;

            // Fetch user to check if they already have a room
            if (userId) {
                const userDoc = await db.collection('users').doc(userId).get();
                if (userDoc.exists) {
                    currentRoomId = userDoc.data()?.roomId || null;
                }
            }

            if (applicationId) {
                const appRef = db.collection('hostel_applications').doc(applicationId);
                const appDoc = await appRef.get();
                if (appDoc.exists) {
                    const appData = appDoc.data();
                    targetUserId = targetUserId || appData?.user_id || appData?.userId;

                    // Update application record
                    await appRef.update({ room_id: newRoomId, roomId: newRoomId, updated_at: new Date().toISOString() });
                }
            }

            if (!targetUserId) {
                return res.status(400).json({ message: "userId or applicationId is required" });
            }

            // --- Update Room Occupancy ---
            // 1. Check new room capacity
            const newRoomRef = db.collection('rooms').doc(newRoomId);
            const newRoomDoc = await newRoomRef.get();
            if (!newRoomDoc.exists) {
                return res.status(404).json({ message: "New room not found" });
            }

            const newRoomData = newRoomDoc.data();
            if ((newRoomData?.currentUsers || 0) >= newRoomData?.maxSize) {
                return res.status(400).json({ message: "Room is full" });
            }

            // 2. Decrement old room if exists
            if (currentRoomId && currentRoomId !== newRoomId) {
                const oldRoomRef = db.collection('rooms').doc(currentRoomId);
                await oldRoomRef.update({
                    currentUsers: admin.firestore.FieldValue.increment(-1)
                });
            }

            // 3. Increment new room (if not same as old)
            if (currentRoomId !== newRoomId) {
                await newRoomRef.update({
                    currentUsers: admin.firestore.FieldValue.increment(1)
                });
            }

            // Update user record
            const userRef = db.collection('users').doc(targetUserId);
            await userRef.update({ roomId: newRoomId });

            return res.status(200).json({ message: "Room changed successfully" });
        } catch (error) {
            console.error("Change room error:", error);
            return res.status(500).json({ message: "Failed to change room" });
        }
    }

    /**
     * Update room application status
     * @route PUT /api/rooms/applications/:id
     */
    static async updateApplicationStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status, action } = req.body;

            const finalStatus = status || (action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending');

            if (!id || !finalStatus) {
                return res.status(400).json({ message: "Application ID and status are required" });
            }

            const ref = db.collection('room_applications').doc(id);
            await ref.update({ status: finalStatus, updated_at: new Date().toISOString() });

            return res.status(200).json({ message: "Application status updated" });
        } catch (error) {
            console.error("Update application error:", error);
            return res.status(500).json({ message: "Failed to update application" });
        }
    }

    /**
     * Get all room applications with user and room details (Admin)
     * @route GET /api/rooms/applications
     */
    static async getRoomApplications(req: Request, res: Response) {
        try {
            const snapshot = await db.collection('room_applications').get();
            const applications = await Promise.all(snapshot.docs.map(async (doc) => {
                const data = doc.data();

                // Fetch user
                const userSnap = await db.collection('users').doc(data.userId).get();
                const userData = userSnap.exists ? userSnap.data() : { name: 'Unknown', student_id: 'Unknown' };

                // Fetch room
                const roomSnap = await db.collection('rooms').doc(data.roomId).get();
                const roomData = roomSnap.exists ? roomSnap.data() : { name: 'Unknown', maxSize: 0 };

                // Fetch other applications for this room to count status
                const otherAppsSnap = await db.collection('room_applications').where('roomId', '==', data.roomId).get();
                const userRooms = otherAppsSnap.docs.map(d => ({ status: d.data().status }));

                return {
                    id: doc.id,
                    user: {
                        name: userData?.name,
                        student_id: userData?.student_id
                    },
                    room: {
                        name: roomData?.name,
                        maxCount: roomData?.maxSize,
                        userRooms: userRooms
                    },
                    status: data.status,
                    created_at: data.created_at
                };
            }));

            return res.status(200).json(applications);
        } catch (error) {
            console.error("Get room applications error:", error);
            return res.status(500).json({ message: "Failed to fetch applications" });
        }
    }

    /**
     * Create a new room
     * @route POST /api/rooms
     */
    static async create(req: Request, res: Response) {
        try {
            const { name, maxSize, hostelId } = req.body;

            if (!name || !maxSize) {
                return res.status(400).json({ message: "Room name and maxSize are required" });
            }

            const ref = db.collection('rooms').doc();
            const room = {
                id: ref.id,
                name,
                maxSize,
                hostelId: hostelId || null,
                currentUsers: 0,
                created_at: new Date().toISOString()
            };
            await ref.set(room);

            // Update Hostel Capacity if hostelId is provided
            if (hostelId) {
                const hostelRef = db.collection('hostels').doc(hostelId);
                const hostelDoc = await hostelRef.get();
                if (hostelDoc.exists) {
                    await hostelRef.update({
                        totalRooms: (hostelDoc.data()?.totalRooms || 0) + 1,
                        totalCapacity: (hostelDoc.data()?.totalCapacity || 0) + parseInt(maxSize)
                    });
                }
            }

            return res.status(201).json(room);
        } catch (error) {
            console.error("Create room error:", error);
            return res.status(500).json({ message: "Failed to create room" });
        }
    }

    /**
     * Fetch all rooms
     * @route GET /api/rooms
     */
    static async fetchAll(req: Request, res: Response) {
        try {
            const snapshot = await db.collection('rooms').get();
            const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return res.status(200).json(rooms);
        } catch (error) {
            console.error("Fetch rooms error:", error);
            return res.status(500).json({ message: "Failed to fetch rooms" });
        }
    }
}
