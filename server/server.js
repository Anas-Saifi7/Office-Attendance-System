import "dotenv/config";
import "express-async-errors";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import connectDB from "./config/db.js";
import User from "./models/User.js";

import authRoutes from "./routes/authRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import leavePolicyRoutes from "./routes/leavePolicyRoutes.js";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://office-attendance-system-six.vercel.app"
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  }
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(id);

    if (!user || !user.isActive) {
      return next(new Error("Account not active"));
    }

    socket.user = user;
    next();

  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
});

app.set("io", io);

// Express middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Health check
app.get("/api/health", (_, res) => {
  res.json({ ok: true });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/leave-policy", leavePolicyRoutes);

// Root route
app.get("/", (_, res) => {
  res.send("Office Attendance System API is running 🚀");
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

io.on("connection", (socket) => {
  const user = socket.user;

  socket.join(`user:${user._id}`);

  if (user.role === "admin") {
    socket.join("role:admin");
  }

  console.log(
    `Socket connected: ${user._id} (${user.role})`
  );

  socket.on("disconnect", () => {
    console.log(
      `Socket disconnected: ${user._id}`
    );
  });
});

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 5000, () => {
      console.log("Server running");
      console.log("Socket.IO is ready");
    });
  })
  .catch((error) => {
    console.error("DB connection failed:", error.message);
    process.exit(1);
  });
