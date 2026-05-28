import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.js";
import {
  getPendingVerifications,
  getKYCHistoryController,
  reviewDriverKYCController,
} from "../../controller/admin/adminController.js";

const router = Router();

// GET /api/admin/verifications/drivers/history — MUST be registered BEFORE the :id route
router.get("/verifications/drivers/history", authMiddleware, getKYCHistoryController);

// GET /api/admin/verifications/drivers — list all SUBMITTED KYC drivers
router.get("/verifications/drivers", authMiddleware, getPendingVerifications);

// PUT /api/admin/verifications/drivers/:id — approve or reject a driver KYC
router.put("/verifications/drivers/:id", authMiddleware, reviewDriverKYCController);

export default router;
