import mongoose, { Schema } from "mongoose";

const friendRequestSchema: Schema = new Schema(
  {
    fromUserId: {
      type: String,
      required: true,
    },
    toUserId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;
