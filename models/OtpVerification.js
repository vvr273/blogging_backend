import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    otpHash: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: null },
    resendCountDaily: { type: Number, default: 0 },
    resendDayKey: { type: String, default: null },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("OtpVerification", otpVerificationSchema);
