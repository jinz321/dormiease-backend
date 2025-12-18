import admin from 'firebase-admin';
import path from 'path';
import { readFileSync } from 'fs';

// Construct path to service account
const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');

let db: admin.firestore.Firestore;

try {
    // Check if app is already initialized
    if (admin.apps.length === 0) {
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        console.log("Loading service account for project:", serviceAccount.project_id);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin initialized successfully.");
    }

    db = admin.firestore();
} catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    console.error(`Ensure 'service-account.json' is present in ${serviceAccountPath}`);
    throw error;
}

export { admin, db };

