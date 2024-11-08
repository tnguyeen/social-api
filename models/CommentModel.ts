import mongoose, { Schema } from "mongoose";

const commentSchema: Schema = new Schema(
  {
    postId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
