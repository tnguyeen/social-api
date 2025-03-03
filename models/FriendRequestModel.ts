import mongoose, { Schema, Types } from "mongoose"
import User from "./UserModel"

export interface FriendRequestType {
  fromUserId: Types.ObjectId
  toUserId: Types.ObjectId
}

const friendRequestSchema: Schema = new Schema<FriendRequestType>(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: User,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: User,
    },
  },
  { timestamps: true }
)

const FriendRequest = mongoose.model<FriendRequestType>(
  "FriendRequest",
  friendRequestSchema
)

export default FriendRequest
