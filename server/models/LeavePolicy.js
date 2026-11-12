import mongoose from "mongoose";

const leavePolicySchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
      unique: true,
    },

    leaveTypes: [
      {
        name: { type: String, required: true },
        code: { type: String, required: true },
        yearlyLimit: { type: Number, default: 0 },
        isPaid: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true },
        carryForward: { type: Boolean, default: false },
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("LeavePolicy", leavePolicySchema);
