import { Router } from "express";
import { login, me, changePassword } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const r = Router();
r.post("/login", login);
r.get("/me", protect, me);
r.put("/password", protect, changePassword);
export default r;
