import { Request, Response } from "express";
import { db } from "../config/firebase";

export class ActivityController {
    /**
     * Get recent activities from all sources
     * @route GET /api/admin/recent-activities
     */
    static async getRecentActivities(req: Request, res: Response) {
        try {
            const limit = 20;

            // Fetch recent complaints
            const complaintsSnap = await db.collection('complaints')
                .orderBy('created_at', 'desc')
                .limit(limit)
                .get();

            const complaints = complaintsSnap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    type: 'complaint',
                    title: data.title || 'New Complaint',
                    description: data.details || '',
                    user: data.studentName || 'Unknown',
                    timestamp: data.created_at,
                    status: data.status || 'open'
                };
            });

            // Fetch recent payments
            const paymentsSnap = await db.collection('payments')
                .orderBy('created_at', 'desc')
                .limit(limit)
                .get();

            const payments = paymentsSnap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    type: 'payment',
                    title: `Payment of RM${data.amount || 0}`,
                    description: data.description || 'Payment received',
                    user: data.studentName || data.userName || 'Unknown',
                    timestamp: data.created_at,
                    status: data.status || 'completed'
                };
            });

            // Fetch recent room applications
            const applicationsSnap = await db.collection('room_applications')
                .orderBy('created_at', 'desc')
                .limit(limit)
                .get();

            const applications = applicationsSnap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    type: 'application',
                    title: 'Room Application',
                    description: `Application for ${data.roomType || 'room'}`,
                    user: data.studentName || data.userName || 'Unknown',
                    timestamp: data.created_at,
                    status: data.status || 'pending'
                };
            });

            // Fetch recent maintenance requests
            const maintenanceSnap = await db.collection('maintenances')
                .orderBy('created_at', 'desc')
                .limit(limit)
                .get();

            const maintenance = maintenanceSnap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    type: 'maintenance',
                    title: data.title || 'Maintenance Request',
                    description: data.details || '',
                    user: data.studentName || 'Unknown',
                    timestamp: data.created_at,
                    status: data.status || 'open'
                };
            });

            // Merge all activities and sort by timestamp
            const allActivities = [...complaints, ...payments, ...applications, ...maintenance];

            allActivities.sort((a, b) => {
                const timeA = new Date(a.timestamp).getTime();
                const timeB = new Date(b.timestamp).getTime();
                return timeB - timeA; // Most recent first
            });

            // Return top 20 most recent
            const recentActivities = allActivities.slice(0, 20);

            return res.status(200).json(recentActivities);
        } catch (error) {
            console.error("Get recent activities error:", error);
            return res.status(500).json({ message: "Failed to fetch recent activities" });
        }
    }
}
