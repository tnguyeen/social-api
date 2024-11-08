import mongoose, { Schema } from "mongoose";

const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    friends: {
      type: Array<String>,
      required: true,
    },
    profilePic: {
      type: String,
    },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

export default User;
