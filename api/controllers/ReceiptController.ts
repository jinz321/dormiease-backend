import { Request, Response } from "express";
import { db } from "../config/firebase";
import { generateReceiptHTML, generateReceiptNumber } from "../utils/receiptTemplate";

export class ReceiptController {

    /**
     * Get receipt data for a payment
     * @route GET /api/receipts/:paymentId
     */
    static async getReceiptData(req: Request, res: Response): Promise<void> {
        const { paymentId } = req.params;

        if (!paymentId) {
            res.status(400).json({ message: "Payment ID is required" });
            return;
        }

        try {
            // Fetch payment
            const paymentDoc = await db.collection('payments').doc(paymentId).get();

            if (!paymentDoc.exists) {
                res.status(404).json({ message: "Payment not found" });
                return;
            }

            const payment = paymentDoc.data();

            // Check if payment is paid
            if (payment?.status !== 'paid') {
                res.status(400).json({ message: "Receipt can only be generated for paid payments" });
                return;
            }

            // Fetch user details
            const userDoc = await db.collection('users').doc(payment.user_id).get();
            const user = userDoc.exists ? userDoc.data() : null;

            // Fetch hostel and room details if available
            let hostelName = null;
            let roomName = null;

            if (user?.roomId) {
                const roomDoc = await db.collection('rooms').doc(user.roomId).get();
                if (roomDoc.exists) {
                    const room = roomDoc.data();
                    roomName = room?.name;

                    if (room?.hostelId) {
                        const hostelDoc = await db.collection('hostels').doc(room.hostelId).get();
                        if (hostelDoc.exists) {
                            hostelName = hostelDoc.data()?.name;
                        }
                    }
                }
            }

            // Generate receipt number if not exists
            let receiptNumber = payment.receipt_number;
            if (!receiptNumber) {
                receiptNumber = generateReceiptNumber();
                // Update payment with receipt number
                await db.collection('payments').doc(paymentId).update({
                    receipt_number: receiptNumber,
                    updated_at: new Date().toISOString()
                });
            }

            const receiptData = {
                receiptNumber,
                paymentId: paymentDoc.id,
                transactionId: payment.transaction_id || 'N/A',
                studentName: user?.name || payment.user_name || 'Unknown',
                studentId: user?.student_id || 'N/A',
                email: user?.email || null,
                feeType: payment.fee_type || 'hostel_fee',
                amount: payment.amount || 0,
                paymentMethod: payment.payment_method || 'N/A',
                paidDate: payment.paid_date || payment.created_at,
                dueDate: payment.due_date || payment.created_at,
                hostelName,
                roomName
            };

            res.status(200).json(receiptData);
        } catch (error) {
            console.error("Get receipt data error:", error);
            res.status(500).json({ message: "Failed to fetch receipt data" });
        }
    }

    /**
     * Get HTML receipt for a payment
     * @route GET /api/receipts/:paymentId/html
     */
    static async getReceiptHTML(req: Request, res: Response): Promise<void> {
        const { paymentId } = req.params;

        if (!paymentId) {
            res.status(400).json({ message: "Payment ID is required" });
            return;
        }

        try {
            // Fetch payment
            const paymentDoc = await db.collection('payments').doc(paymentId).get();

            if (!paymentDoc.exists) {
                res.status(404).send("<h1>Payment not found</h1>");
                return;
            }

            const payment = paymentDoc.data();

            // Check if payment is paid
            if (payment?.status !== 'paid') {
                res.status(400).send("<h1>Receipt can only be generated for paid payments</h1>");
                return;
            }

            // Fetch user details
            const userDoc = await db.collection('users').doc(payment.user_id).get();
            const user = userDoc.exists ? userDoc.data() : null;

            // Fetch hostel and room details if available
            let hostelName = null;
            let roomName = null;

            if (user?.roomId) {
                const roomDoc = await db.collection('rooms').doc(user.roomId).get();
                if (roomDoc.exists) {
                    const room = roomDoc.data();
                    roomName = room?.name;

                    if (room?.hostelId) {
                        const hostelDoc = await db.collection('hostels').doc(room.hostelId).get();
                        if (hostelDoc.exists) {
                            hostelName = hostelDoc.data()?.name;
                        }
                    }
                }
            }

            // Generate receipt number if not exists
            let receiptNumber = payment.receipt_number;
            if (!receiptNumber) {
                receiptNumber = generateReceiptNumber();
                // Update payment with receipt number
                await db.collection('payments').doc(paymentId).update({
                    receipt_number: receiptNumber,
                    updated_at: new Date().toISOString()
                });
            }

            const receiptData = {
                receiptNumber,
                paymentId: paymentDoc.id,
                transactionId: payment.transaction_id || 'N/A',
                studentName: user?.name || payment.user_name || 'Unknown',
                studentId: user?.student_id || 'N/A',
                email: user?.email || undefined,
                feeType: payment.fee_type || 'hostel_fee',
                amount: payment.amount || 0,
                paymentMethod: payment.payment_method || 'N/A',
                paidDate: payment.paid_date || payment.created_at,
                dueDate: payment.due_date || payment.created_at,
                hostelName: hostelName || undefined,
                roomName: roomName || undefined
            };

            const html = generateReceiptHTML(receiptData);

            res.setHeader('Content-Type', 'text/html');
            res.send(html);
        } catch (error) {
            console.error("Get receipt HTML error:", error);
            res.status(500).send("<h1>Failed to generate receipt</h1>");
        }
    }

    /**
     * Download receipt as HTML file
     * @route GET /api/receipts/:paymentId/download
     */
    static async downloadReceipt(req: Request, res: Response): Promise<void> {
        const { paymentId } = req.params;

        if (!paymentId) {
            res.status(400).json({ message: "Payment ID is required" });
            return;
        }

        try {
            // Fetch payment
            const paymentDoc = await db.collection('payments').doc(paymentId).get();

            if (!paymentDoc.exists) {
                res.status(404).send("<h1>Payment not found</h1>");
                return;
            }

            const payment = paymentDoc.data();

            // Check if payment is paid
            if (payment?.status !== 'paid') {
                res.status(400).send("<h1>Receipt can only be generated for paid payments</h1>");
                return;
            }

            // Fetch user details
            const userDoc = await db.collection('users').doc(payment.user_id).get();
            const user = userDoc.exists ? userDoc.data() : null;

            // Fetch hostel and room details if available
            let hostelName = null;
            let roomName = null;

            if (user?.roomId) {
                const roomDoc = await db.collection('rooms').doc(user.roomId).get();
                if (roomDoc.exists) {
                    const room = roomDoc.data();
                    roomName = room?.name;

                    if (room?.hostelId) {
                        const hostelDoc = await db.collection('hostels').doc(room.hostelId).get();
                        if (hostelDoc.exists) {
                            hostelName = hostelDoc.data()?.name;
                        }
                    }
                }
            }

            // Generate receipt number if not exists
            let receiptNumber = payment.receipt_number;
            if (!receiptNumber) {
                receiptNumber = generateReceiptNumber();
                // Update payment with receipt number
                await db.collection('payments').doc(paymentId).update({
                    receipt_number: receiptNumber,
                    updated_at: new Date().toISOString()
                });
            }

            const receiptData = {
                receiptNumber,
                paymentId: paymentDoc.id,
                transactionId: payment.transaction_id || 'N/A',
                studentName: user?.name || payment.user_name || 'Unknown',
                studentId: user?.student_id || 'N/A',
                email: user?.email || undefined,
                feeType: payment.fee_type || 'hostel_fee',
                amount: payment.amount || 0,
                paymentMethod: payment.payment_method || 'N/A',
                paidDate: payment.paid_date || payment.created_at,
                dueDate: payment.due_date || payment.created_at,
                hostelName: hostelName || undefined,
                roomName: roomName || undefined
            };

            const html = generateReceiptHTML(receiptData);

            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Content-Disposition', `attachment; filename="Receipt-${receiptNumber}.html"`);
            res.send(html);
        } catch (error) {
            console.error("Download receipt error:", error);
            res.status(500).send("<h1>Failed to download receipt</h1>");
        }
    }
}
