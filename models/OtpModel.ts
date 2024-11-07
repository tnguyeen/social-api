import mongoose, { Schema } from "mongoose";

const otpSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 5 });
const OtpModel = mongoose.model("Otp", otpSchema);

export default OtpModel;
