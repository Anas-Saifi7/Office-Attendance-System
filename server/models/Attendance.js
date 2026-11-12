import mongoose from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    time: Date,
    lat: Number,
    lng: Number,
    accuracy: Number,
    address: String,
    distanceFromOffice: Number,
  },
  { _id: false },
);

const attendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    checkIn: pointSchema,
    checkOut: pointSchema,
    status: { type: String, enum: ["present", "late"], default: "present" },
    workingMinutes: { type: Number, default: 0 },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    editNote: String,
  },
  { timestamps: true },
);

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
