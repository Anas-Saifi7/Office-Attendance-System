import { Router } from "express";
import { checkIn, checkOut, today, myHistory } from "../controllers/attendanceController.js";
import { protect } from "../middleware/auth.js";

const r = Router();
r.use(protect);
r.post("/check-in", checkIn);
r.post("/check-out", checkOut);
r.get("/today", today);
r.get("/my", myHistory);
export default r;
