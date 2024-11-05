import { ObjectId } from "mongodb"
import mongoose, { Schema } from "mongoose"

const postSchema: Schema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    comments: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)
const Post = mongoose.model("Post", postSchema)

export default Post