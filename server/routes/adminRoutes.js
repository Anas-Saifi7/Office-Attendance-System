import { Router } from "express";
import * as a from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const r = Router();
r.use(protect, adminOnly);
r.get("/dashboard", a.dashboard);
r.get("/employees", a.listEmployees);
r.post("/employees", a.createEmployee);
r.put("/employees/:id", a.updateEmployee);
r.get("/attendance", a.listAttendance);
r.get("/attendance/export", a.exportCsv);
r.put("/attendance/:id", a.editAttendance);
r.get("/office", a.getOffice);
r.put("/office", a.updateOffice);
export default r;
