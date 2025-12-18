import { Request, Response } from "express";
import { db } from "../config/firebase";
import { compare, hash } from "bcrypt-ts";

export class UserController {

  // ======================
  // User Signup
  // ======================
  static async signup(req: Request, res: Response) {
    try {
      console.log('=== Signup request received ===');
      console.log('Request body:', req.body);

      const { name, studentId, email, password } = req.body;

      // Detailed validation
      if (!name || name.trim() === '') {
        return res.status(400).json({ message: "Name is required" });
      }
      if (!studentId || studentId.toString().trim() === '') {
        return res.status(400).json({ message: "Student ID is required" });
      }
      if (!email || email.trim() === '') {
        return res.status(400).json({ message: "Email is required" });
      }
      if (!password || password.trim() === '') {
        return res.status(400).json({ message: "Password is required" });
      }

      console.log('Validation passed, checking for existing email...');
      const usersSnap = await db.collection('users').where('email', '==', email).limit(1).get();

      if (!usersSnap.empty) {
        console.log('Email already exists:', email);
        return res.status(409).json({ message: "Email already exists" });
      }

      console.log('Hashing password...');
      const hashedPassword = await hash(password, 10);
      const ref = db.collection('users').doc();

      const user = {
        id: ref.id,
        name,
        student_id: studentId,
        email,
        password: hashedPassword,
        created_at: new Date().toISOString()
      };

      console.log('Creating user in Firestore...');
      await ref.set(user);
      console.log('User created successfully:', user.id);

      // 🔔 2️⃣ Assign ALL existing notifications to this new user
      console.log('Assigning notifications to new user...');
      const notifsSnap = await db.collection('notifications').get();
      if (!notifsSnap.empty) {
        const batch = db.batch();
        notifsSnap.forEach(n => {
          const uNotifRef = db.collection('user_notifications').doc();
          batch.set(uNotifRef, {
            id: uNotifRef.id,
            user_id: user.id,
            notification_id: n.id,
            is_read: false,
            created_at: new Date().toISOString()
          });
        });
        await batch.commit();
        console.log('Notifications assigned successfully');
      }

      console.log('=== Signup successful ===');
      return res.status(201).json({
        message: "User created",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          studentId: user.student_id,
        },
      });

    } catch (error: any) {
      console.error("=== Signup error ===");
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Request body:", req.body);
      console.error("===================");
      return res.status(500).json({ message: "Failed to create user", error: error.message });
    }
  }

  // ======================
  // User Signin
  // ======================
  static async signin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const usersSnap = await db.collection('users').where('email', '==', email).limit(1).get();

      if (usersSnap.empty) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const userDoc = usersSnap.docs[0];
      const userData = userDoc.data();

      const passwordMatch = await compare(password, userData.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      return res.status(200).json({
        user: {
          id: userDoc.id,
          name: userData.name,
          email: userData.email,
          studentId: userData.student_id,
        },
      });

    } catch (error) {
      console.error("Signin error:", error);
      return res.status(500).json({ message: "Failed to login" });
    }
  }

  // ======================
  // Get All Users
  // ======================
  static async getAllUsers(req: Request, res: Response) {
    try {
      const snapshot = await db.collection('users').get();
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));

      return res.status(200).json(users);
    } catch (error) {
      console.error("Get users error:", error);
      return res.status(500).send("Failed to fetch users");
    }
  }

  // ======================
  // Get All Admins
  // ======================
  static async getAllAdmins(req: Request, res: Response) {
    try {
      const snapshot = await db.collection('admins').get();
      const admins = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));

      return res.status(200).json(admins);
    } catch (error) {
      console.error("Get admins error:", error);
      return res.status(500).send("Failed to fetch admins");
    }
  }

  // ======================
  // Update Profile
  // ======================
  static async updateProfile(req: Request, res: Response) {
    try {
      const { userId, name, email, password, profile_image } = req.body;

      console.log('UpdateProfile: Received request for userId:', userId);
      console.log('UpdateProfile: Has profile_image?', !!profile_image);
      if (profile_image) {
        console.log('UpdateProfile: profile_image length:', profile_image.length);
      }

      if (!userId) {
        return res.status(400).json({ message: "UserId is required" });
      }

      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ message: "User not found" });
      }

      const updates: any = {};
      if (name) updates.name = name;
      if (email) updates.email = email;
      if (profile_image) {
        updates.profile_image = profile_image;
        console.log('UpdateProfile: Adding profile_image to updates');
      }

      if (password) {
        updates.password = await hash(password, 10);
      }

      console.log('UpdateProfile: Update keys:', Object.keys(updates));
      await userRef.update(updates);
      console.log('UpdateProfile: Firestore update complete');

      // Fetch updated user data to return
      const updatedDoc = await userRef.get();
      const updatedData = updatedDoc.data();

      console.log('UpdateProfile: Updated data has profile_image?', !!updatedData?.profile_image);

      return res.status(200).json({
        message: "Profile updated successfully",
        user: {
          id: updatedDoc.id,
          name: updatedData?.name,
          email: updatedData?.email,
          studentId: updatedData?.student_id,
          profile_image: updatedData?.profile_image,
        }
      });

    } catch (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({ message: "Failed to update profile" });
    }
  }
}
