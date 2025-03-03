import mongoose, { Schema, Types } from "mongoose"

export interface UserType {
  username: string
  password: string
  email: string
  verified: Boolean
  friends: Types.ObjectId[]
  profilePic: string
}

const userSchema: Schema = new Schema<UserType>(
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
    friends: [{ type: Schema.Types.ObjectId }],
    profilePic: {
      type: String,
    },
  },
  { timestamps: true }
)
const User = mongoose.model<UserType>("User", userSchema)

export default User
