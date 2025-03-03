import mongoose, { Schema, Types } from "mongoose"
import User from "./UserModel"
import Conversation from "./ConversationModel"

export interface MessageType {
  conversationId: Types.ObjectId
  senderId: Types.ObjectId
  content: string
  isRead: Boolean
}

const messageSchema: Schema = new Schema<MessageType>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: Conversation,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: User,
    },
    content: {
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
const Message = mongoose.model<MessageType>("Message", messageSchema)

export default Message
