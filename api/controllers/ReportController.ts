import { Request, Response } from "express";
import { db } from "../config/firebase";

export class ReportController {

    /**
     * Get occupancy report
     * @route GET /api/report/occupancy
     */
    static async getOccupancyReport(req: Request, res: Response): Promise<void> {
        try {
            // Get all rooms
            const roomsSnapshot = await db.collection('rooms').get();
            const rooms = roomsSnapshot.docs.map(doc => doc.data());

            // Get all room applications
            const applicationsSnapshot = await db.collection('room_applications').get();
            const applications = applicationsSnapshot.docs.map(doc => doc.data());

            const totalRooms = rooms.length;
            const occupiedRooms = rooms.filter(r => r.current_occupancy > 0).length;
            const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
            const currentOccupancy = rooms.reduce((sum, r) => sum + (r.current_occupancy || 0), 0);
            const occupancyRate = totalCapacity > 0 ? (currentOccupancy / totalCapacity) * 100 : 0;

            const report = {
                total_rooms: totalRooms,
                occupied_rooms: occupiedRooms,
                vacant_rooms: totalRooms - occupiedRooms,
                total_capacity: totalCapacity,
                current_occupancy: currentOccupancy,
                available_spaces: totalCapacity - currentOccupancy,
                occupancy_rate: Math.round(occupancyRate * 100) / 100,
                pending_applications: applications.filter(a => a.status === 'pending').length,
                approved_applications: applications.filter(a => a.status === 'approved').length,
                rejected_applications: applications.filter(a => a.status === 'rejected').length,
            };

            res.status(200).json(report);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to generate occupancy report" });
        }
    }

    /**
     * Get payment report
     * @route GET /api/report/payments
     */
    static async getPaymentReport(req: Request, res: Response): Promise<void> {
        try {
            const paymentsSnapshot = await db.collection('payments').get();
            const payments = paymentsSnapshot.docs.map(doc => doc.data());

            const totalPayments = payments.length;
            const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
            const paidPayments = payments.filter(p => p.status === 'paid');
            const pendingPayments = payments.filter(p => p.status === 'pending');
            const overduePayments = payments.filter(p => p.status === 'overdue');

            const report = {
                total_payments: totalPayments,
                total_amount: Math.round(totalAmount * 100) / 100,
                paid: {
                    count: paidPayments.length,
                    amount: Math.round(paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0) * 100) / 100,
                    percentage: totalPayments > 0 ? Math.round((paidPayments.length / totalPayments) * 100 * 100) / 100 : 0
                },
                pending: {
                    count: pendingPayments.length,
                    amount: Math.round(pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0) * 100) / 100,
                    percentage: totalPayments > 0 ? Math.round((pendingPayments.length / totalPayments) * 100 * 100) / 100 : 0
                },
                overdue: {
                    count: overduePayments.length,
                    amount: Math.round(overduePayments.reduce((sum, p) => sum + (p.amount || 0), 0) * 100) / 100,
                    percentage: totalPayments > 0 ? Math.round((overduePayments.length / totalPayments) * 100 * 100) / 100 : 0
                },
                collection_rate: totalAmount > 0 ? Math.round((paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0) / totalAmount) * 100 * 100) / 100 : 0
            };

            res.status(200).json(report);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to generate payment report" });
        }
    }

    /**
     * Get maintenance report
     * @route GET /api/report/maintenance
     */
    static async getMaintenanceReport(req: Request, res: Response): Promise<void> {
        try {
            const maintenanceSnapshot = await db.collection('maintenance_requests').get();
            const requests = maintenanceSnapshot.docs.map(doc => doc.data());

            const totalRequests = requests.length;
            const pendingRequests = requests.filter(r => r.status === 'pending');
            const inProgressRequests = requests.filter(r => r.status === 'in_progress');
            const completedRequests = requests.filter(r => r.status === 'completed');

            const report = {
                total_requests: totalRequests,
                pending: {
                    count: pendingRequests.length,
                    percentage: totalRequests > 0 ? Math.round((pendingRequests.length / totalRequests) * 100 * 100) / 100 : 0
                },
                in_progress: {
                    count: inProgressRequests.length,
                    percentage: totalRequests > 0 ? Math.round((inProgressRequests.length / totalRequests) * 100 * 100) / 100 : 0
                },
                completed: {
                    count: completedRequests.length,
                    percentage: totalRequests > 0 ? Math.round((completedRequests.length / totalRequests) * 100 * 100) / 100 : 0
                },
                completion_rate: totalRequests > 0 ? Math.round((completedRequests.length / totalRequests) * 100 * 100) / 100 : 0
            };

            res.status(200).json(report);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to generate maintenance report" });
        }
    }

    /**
     * Get complaint report
     * @route GET /api/report/complaints
     */
    static async getComplaintReport(req: Request, res: Response): Promise<void> {
        try {
            const complaintsSnapshot = await db.collection('complaints').get();
            const complaints = complaintsSnapshot.docs.map(doc => doc.data());

            const totalComplaints = complaints.length;
            const pendingComplaints = complaints.filter(c => c.status === 'pending');
            const inProgressComplaints = complaints.filter(c => c.status === 'in_progress');
            const resolvedComplaints = complaints.filter(c => c.status === 'resolved');

            const report = {
                total_complaints: totalComplaints,
                pending: {
                    count: pendingComplaints.length,
                    percentage: totalComplaints > 0 ? Math.round((pendingComplaints.length / totalComplaints) * 100 * 100) / 100 : 0
                },
                in_progress: {
                    count: inProgressComplaints.length,
                    percentage: totalComplaints > 0 ? Math.round((inProgressComplaints.length / totalComplaints) * 100 * 100) / 100 : 0
                },
                resolved: {
                    count: resolvedComplaints.length,
                    percentage: totalComplaints > 0 ? Math.round((resolvedComplaints.length / totalComplaints) * 100 * 100) / 100 : 0
                },
                resolution_rate: totalComplaints > 0 ? Math.round((resolvedComplaints.length / totalComplaints) * 100 * 100) / 100 : 0
            };

            res.status(200).json(report);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to generate complaint report" });
        }
    }

    /**
     * Get dashboard overview
     * @route GET /api/report/dashboard
     */
    static async getDashboardOverview(req: Request, res: Response): Promise<void> {
        try {
            // Get counts from all collections
            const [users, rooms, payments, maintenance, complaints, notifications] = await Promise.all([
                db.collection('users').count().get(),
                db.collection('rooms').count().get(),
                db.collection('payments').count().get(),
                db.collection('maintenance_requests').count().get(),
                db.collection('complaints').count().get(),
                db.collection('notifications').count().get(),
            ]);

            // Get recent activity
            const recentMaintenanceSnapshot = await db.collection('maintenance_requests')
                .orderBy('created_at', 'desc')
                .limit(5)
                .get();

            const recentComplaintsSnapshot = await db.collection('complaints')
                .orderBy('created_at', 'desc')
                .limit(5)
                .get();

            const overview = {
                total_users: users.data().count,
                total_rooms: rooms.data().count,
                total_payments: payments.data().count,
                total_maintenance: maintenance.data().count,
                total_complaints: complaints.data().count,
                total_notifications: notifications.data().count,
                recent_maintenance: recentMaintenanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                recent_complaints: recentComplaintsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            };

            res.status(200).json(overview);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to generate dashboard overview" });
        }
    }
}
