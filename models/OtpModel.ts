import { ObjectId } from "mongodb";
import mongoose, { Schema } from "mongoose";

const otpSchema: Schema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, expireAfterSeconds: 120 }
);
const OtpModel = mongoose.model("OtpModel", otpSchema);

export default OtpModel;
