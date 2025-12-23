import { Request, Response } from "express";
import { db } from "../config/firebase";
import { parsePaginationParams, createPaginatedResponse } from "../utils/types";

export class PaymentController {

    /**
     * Create a new payment record
     * @route POST /api/payment/create
     */
    static async createPayment(req: Request, res: Response): Promise<void> {
        const { user_id, amount, fee_type, due_date } = req.body;

        if (!user_id || !amount || !fee_type || !due_date) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        try {
            // Get user details
            const userDoc = await db.collection('users').doc(user_id).get();
            if (!userDoc.exists) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            const userData = userDoc.data();
            const paymentRef = db.collection('payments').doc();

            const payment = {
                id: paymentRef.id,
                user_id,
                user_name: userData?.name || 'Unknown',
                amount: parseFloat(amount),
                fee_type,
                status: 'pending',
                due_date,
                paid_date: null,
                payment_method: null,
                receipt_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await paymentRef.set(payment);
            res.status(201).json(payment);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to create payment" });
        }
    }

    /**
     * Get all payments (Admin)
     * @route GET /api/payment/all?limit=50&offset=0
     */
    static async getAllPayments(req: Request, res: Response): Promise<void> {
        try {
            const { limit, offset } = parsePaginationParams(req.query);
            const usePagination = req.query.limit !== undefined || req.query.offset !== undefined;

            // Get total count
            const countSnapshot = await db.collection('payments').count().get();
            const total = countSnapshot.data().count;

            // Fetch with pagination
            let query = db.collection('payments').orderBy('created_at', 'desc');

            if (usePagination) {
                query = query.limit(limit).offset(offset);
            }

            const snapshot = await query.get();
            const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (usePagination) {
                res.status(200).json(createPaginatedResponse(payments, total, limit, offset));
            } else {
                res.status(200).json(payments);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to fetch payments" });
        }
    }

    /**
     * Get payments for a specific user
     * @route GET /api/payment/user/:userId
     */
    static async getUserPayments(req: Request, res: Response): Promise<void> {
        const userId = req.params.userId;

        if (!userId) {
            res.status(400).json({ message: "Invalid user id" });
            return;
        }

        try {
            // Get total count first
            const countSnapshot = await db.collection('payments')
                .where('user_id', '==', userId)
                .count()
                .get();
            const total = countSnapshot.data().count;

            // If no payments, return empty array
            if (total === 0) {
                res.status(200).json([]);
                return;
            }

            const snapshot = await db.collection('payments')
                .where('user_id', '==', userId)
                .orderBy('created_at', 'desc')
                .get();

            const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.status(200).json(payments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to fetch user payments" });
        }
    }

    /**
     * Update payment status
     * @route PUT /api/payment/update/:id
     */
    static async updatePayment(req: Request, res: Response): Promise<void> {
        const paymentId = req.params.id;
        const { status, payment_method, paid_date } = req.body;

        if (!paymentId) {
            res.status(400).json({ message: "Invalid payment id" });
            return;
        }

        try {
            const paymentRef = db.collection('payments').doc(paymentId);
            const paymentDoc = await paymentRef.get();

            if (!paymentDoc.exists) {
                res.status(404).json({ message: "Payment not found" });
                return;
            }

            const updateData: any = {
                updated_at: new Date().toISOString()
            };

            if (status) updateData.status = status;
            if (payment_method) updateData.payment_method = payment_method;
            if (paid_date) updateData.paid_date = paid_date;

            // If marking as paid, set paid_date if not provided
            if (status === 'paid' && !paid_date) {
                updateData.paid_date = new Date().toISOString();
            }

            await paymentRef.update(updateData);

            const updatedDoc = await paymentRef.get();
            res.status(200).json({ id: updatedDoc.id, ...updatedDoc.data() });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to update payment" });
        }
    }

    /**
     * Delete a payment
     * @route DELETE /api/payment/:id
     */
    static async deletePayment(req: Request, res: Response): Promise<void> {
        const paymentId = req.params.id;

        if (!paymentId) {
            res.status(400).json({ message: "Invalid payment id" });
            return;
        }

        try {
            await db.collection('payments').doc(paymentId).delete();
            res.status(200).json({ message: "Payment deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to delete payment" });
        }
    }

    /**
     * Get payment statistics
     * @route GET /api/payment/stats
     */
    static async getPaymentStats(req: Request, res: Response): Promise<void> {
        try {
            const paymentsSnapshot = await db.collection('payments').get();
            const payments = paymentsSnapshot.docs.map(doc => doc.data());

            const stats = {
                total_payments: payments.length,
                total_amount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
                paid_count: payments.filter(p => p.status === 'paid').length,
                paid_amount: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0),
                pending_count: payments.filter(p => p.status === 'pending').length,
                pending_amount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0),
                overdue_count: payments.filter(p => p.status === 'overdue').length,
                overdue_amount: payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + (p.amount || 0), 0),
            };

            res.status(200).json(stats);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to fetch payment statistics" });
        }
    }

    /**
     * Process a payment (Simulated payment gateway)
     * @route POST /api/payment/process/:id
     */
    static async processPayment(req: Request, res: Response): Promise<void> {
        const paymentId = req.params.id;
        const { payment_method } = req.body;

        if (!paymentId) {
            res.status(400).json({ message: "Invalid payment id" });
            return;
        }

        if (!payment_method) {
            res.status(400).json({ message: "Payment method is required" });
            return;
        }

        try {
            const paymentRef = db.collection('payments').doc(paymentId);
            const paymentDoc = await paymentRef.get();

            if (!paymentDoc.exists) {
                res.status(404).json({ message: "Payment not found" });
                return;
            }

            const paymentData = paymentDoc.data();

            // Check if already paid
            if (paymentData?.status === 'paid') {
                res.status(400).json({ message: "Payment already completed" });
                return;
            }

            // Simulate payment processing
            // In production, this would call Stripe/PayPal/etc API
            const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            // Update payment record
            await paymentRef.update({
                status: 'paid',
                payment_method,
                paid_date: new Date().toISOString(),
                transaction_id: transactionId,
                updated_at: new Date().toISOString()
            });

            const updatedDoc = await paymentRef.get();

            res.status(200).json({
                message: "Payment processed successfully",
                payment: { id: updatedDoc.id, ...updatedDoc.data() },
                transaction_id: transactionId
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to process payment" });
        }
    }
}
