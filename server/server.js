import "dotenv/config";
import "express-async-errors";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import leavePolicyRoutes from "./routes/leavePolicyRoutes.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get("/api/health", (_, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/leave-policy", leavePolicyRoutes);

app.get("/", (req, res) => {
  res.send("Office Attendance System API is running 🚀");
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

connectDB()
  .then(() => app.listen(process.env.PORT || 5000, () => console.log("Server running")))
  .catch((e) => { console.error("DB connection failed:", e.message); process.exit(1); });
