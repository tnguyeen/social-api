import mongoose, { Schema, Types } from "mongoose"
import User from "./UserModel"

export interface PostType {
  userId: Types.ObjectId
  username: string
  profilePic: string
  caption: string
  image: string[]
  likes: string[]
}

const postSchema: Schema = new Schema<PostType>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: User,
    },
    username: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    caption: {
      type: String,
      required: true,
    },
    image: [
      {
        type: String,
        required: true,
      },
    ],
    likes: [{ type: String, default: [] }],
  },
  { timestamps: true }
)
const Post = mongoose.model<PostType>("Post", postSchema)

export default Post
