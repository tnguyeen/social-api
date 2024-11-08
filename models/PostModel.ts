import mongoose, { Schema } from "mongoose";

const postSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
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
    image: {
      type: String,
      default: "",
    },
    likes: {
      type: Array<String>,
      default: [],
    },
  },
  { timestamps: true }
);
const Post = mongoose.model("Post", postSchema);

export default Post;
