import mongoose from "mongoose";

const officeSchema = new mongoose.Schema({
  name: { type: String, default: "Main Office" },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  radius: { type: Number, default: 200 },
  enforceGeofence: { type: Boolean, default: false },
  workStart: { type: String, default: "09:30" },
  graceMinutes: { type: Number, default: 15 },
});

export default mongoose.model("Office", officeSchema);
