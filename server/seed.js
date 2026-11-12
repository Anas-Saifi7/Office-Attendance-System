import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Office from "./models/Office.js";

await mongoose.connect(process.env.MONGO_URI);
if (!(await User.findOne({ email: process.env.ADMIN_EMAIL.toLowerCase() }))) {
  await User.create({
    name: "Admin",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: "admin",
  });
  console.log("Admin created:", process.env.ADMIN_EMAIL);
} else console.log("Admin already exists");
if (!(await Office.findOne())) await Office.create({});
await mongoose.disconnect();
