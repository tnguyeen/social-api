import mongoose, { Schema } from "mongoose";
import { ObjectId } from "mongodb";

const friendRequestSchema: Schema = new Schema(
  {
    fromUserId: {
      type: ObjectId,
      required: true,
    },
    toUserId: {
      type: ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;
