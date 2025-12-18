import admin from 'firebase-admin';
import path from 'path';
import { readFileSync } from 'fs';

// Construct path to service account
const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');

let db: admin.firestore.Firestore;

try {
    // Check if app is already initialized
    if (admin.apps.length === 0) {
        let serviceAccount;

        // Try to read from environment variable first (for Render deployment)
        if (process.env.FIREBASE_CONFIG) {
            console.log("Loading Firebase credentials from environment variable");
            serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
        } else {
            // Fallback to file (for local development)
            console.log("Loading Firebase credentials from file");
            serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        }

        console.log("Loading service account for project:", serviceAccount.project_id);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin initialized successfully.");
    }

    db = admin.firestore();
} catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    console.error(`Ensure 'service-account.json' is present in ${serviceAccountPath} or FIREBASE_CONFIG env var is set`);
    throw error;
}

export { admin, db };

