import { ObjectId } from "mongodb"
import mongoose, { Schema } from "mongoose"

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
    followers: {
      type: Array<ObjectId>,
      required: true,
    },
    following: {
      type: Array<ObjectId>,
      required: true,
    },
    profilePic: {
      type: String,
    },
    posts:{
      type: Array<ObjectId>,
      required: true,
      default: []
    }
  },
  { timestamps: true }
)
const User = mongoose.model("User", userSchema)

export default User