
import express from "express";

import {
  applyLeave,
  myLeaves,
  leaveDetails,
  cancelLeave,
  allLeaves,
  updateLeaveStatus,
} from "../controllers/leaveController.js";

import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Employee routes
router.post("/apply", protect, applyLeave);
router.get("/my", protect, myLeaves);
router.get("/:id", protect, leaveDetails);
router.put("/:id/cancel", protect, cancelLeave);

// Admin routes
router.get("/admin/all", protect, adminOnly, allLeaves);
router.put("/admin/:id/status", protect, adminOnly, updateLeaveStatus);

export default router;
