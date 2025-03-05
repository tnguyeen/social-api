import mongoose, { Schema, Types } from "mongoose"
import User from "./UserModel"

export interface NotificationType {
  userId: Types.ObjectId
  type:
    | "message"
    | "friend-request"
    | "like-post"
    | "comment-post"
    | "accept-friend"
  username: string
  picture: string
  path: string
  isRead: Boolean
}

const notificationSchema: Schema = new Schema<NotificationType>(
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
    picture: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
)

const Notification = mongoose.model<NotificationType>(
  "Notification",
  notificationSchema
)

export default Notification
