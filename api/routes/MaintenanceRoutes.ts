import express, { Router } from "express"
import { MaintenanceController } from "../controllers/MaintenanceController"

const router = Router()

// ===============================
// STUDENT: Submit maintenance
// ===============================
router.post(
  "/user/submit-maintenance",
  MaintenanceController.submitMaintenance as express.RequestHandler
)

// ===============================
// ADMIN: Resolve maintenance
// ===============================
router.put(
  "/admin/update-maintenance/:id",
  MaintenanceController.updateMaintenance as express.RequestHandler
)

// ===============================
// ADMIN: Fetch all maintenances
// ===============================
router.get(
  "/all",
  MaintenanceController.fetchAll as express.RequestHandler
)

// ===============================
// STUDENT: Fetch own maintenances by USER ID
// ===============================
router.get(
  "/user/:userId",
  MaintenanceController.fetchByUserId as express.RequestHandler
)

// ===============================
// STUDENT: Fetch own maintenances by STUDENT ID
// ===============================
router.get(
  "/student/:studentId",
  MaintenanceController.fetchByStudent as express.RequestHandler
)

export default router
