import { Request, Response } from "express";
import { db } from "../config/firebase";
import { compare, hash } from "bcrypt-ts";

export class AdminController {

    /**
     * Admin signup/registration
     * @route POST /api/admin/signup
     */
    static async signup(req: Request, res: Response) {
        try {
            console.log("Admin Signup Request Body:", req.body);
            const { name, staff_id, password } = req.body;

            if (!name || !staff_id || !password) {
                return res.status(400).json({ message: "All fields are required" });
            }

            console.log("Checking if staff_id exists...");
            const adminsSnap = await db.collection('admins').where('staff_id', '==', staff_id).limit(1).get();

            if (!adminsSnap.empty) {
                console.log("Staff ID already exists:", staff_id);
                return res.status(409).json({ message: "Staff ID already exists" });
            }

            console.log("Hashing password...");
            const hashedPassword = await hash(password, 10);

            console.log("Creating document reference...");
            const ref = db.collection('admins').doc();

            const admin = {
                id: ref.id,
                name,
                staff_id,
                password: hashedPassword,
                created_at: new Date().toISOString()
            };

            console.log("Writing to Firestore:", admin.id);
            await ref.set(admin);
            console.log("Write successful!");

            return res.status(201).json({
                message: "Admin created",
                admin: {
                    id: admin.id,
                    name: admin.name,
                    staff_id: admin.staff_id,
                },
            });

        } catch (error: unknown) {
            console.error("Admin Signup error detailed:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            const errorCode = (error as { code?: string }).code;
            return res.status(500).json({
                message: "Failed to create admin",
                error: errorMessage,
                code: errorCode
            });
        }
    }

    /**
     * Admin signin/login
     * @route POST /api/admin/signin
     */
    static async signin(req: Request, res: Response) {
        try {
            console.log("Admin Signin Request Body:", req.body);
            const { staff_id, password } = req.body;

            if (!staff_id || !password) {
                return res.status(400).json({ message: "Staff ID and password are required" });
            }

            console.log("Searching for admin with staff_id:", staff_id);
            const adminsSnap = await db.collection('admins').where('staff_id', '==', staff_id).limit(1).get();

            if (adminsSnap.empty) {
                console.log("No admin found with staff_id:", staff_id);
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const adminDoc = adminsSnap.docs[0];
            const adminData = adminDoc.data();
            console.log("Admin found, comparing password...");

            const passwordMatch = await compare(password, adminData.password);

            if (!passwordMatch) {
                console.log("Password mismatch for staff_id:", staff_id);
                return res.status(401).json({ message: "Invalid credentials" });
            }

            console.log("Signin successful for:", staff_id);
            return res.status(200).json({
                admin: {
                    id: adminDoc.id,
                    name: adminData.name,
                    staff_id: adminData.staff_id,
                },
            });

        } catch (error) {
            console.error("Admin Signin error:", error);
            return res.status(500).json({ message: "Failed to login admin" });
        }
    }

    /**
     * Debug endpoint to list all admins
     * @route GET /api/admin/list
     */
    static async listAdmins(req: Request, res: Response) {
        try {
            const snap = await db.collection('admins').get();
            const admins = snap.docs.map(d => ({
                id: d.id,
                staff_id: d.data().staff_id,
                name: d.data().name
            }));
            return res.status(200).json({ count: snap.size, admins });
        } catch (error: unknown) {
            console.error("Debug listAdmins error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            return res.status(500).json({ error: errorMessage });
        }
    }
}
