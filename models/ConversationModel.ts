import mongoose, { Schema, Types } from "mongoose"
import User from "./UserModel"

interface ConversationType {
  listUserId: Types.ObjectId[]
  listUsername: string[]
  listUserProfilePic: string[]
  lastMessageTime: Date
}

const conversationSchema: Schema = new Schema<ConversationType>(
  {
    listUserId: [{ type: Schema.Types.ObjectId, ref: User }],
    listUsername: [
      {
        type: String,
        required: true,
      },
    ],
    listUserProfilePic: [
      {
        type: String,
        required: true,
      },
    ],
    lastMessageTime: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
)
const Conversation = mongoose.model<ConversationType>(
  "Conversation",
  conversationSchema
)

export default Conversation
