
import express from "express";

import {
  getLeavePolicy,
  updateLeavePolicy,
} from "../controllers/leavePolicyController.js";

import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getLeavePolicy);
router.put("/", protect, adminOnly, updateLeavePolicy);

export default router;
