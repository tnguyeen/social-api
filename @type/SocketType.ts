import { Types } from "mongoose"

type onMessageType = (data: {
  content: string
  room: string
  senderUsername: string
}) => void
type onJoinType = (data: { username: string; room?: string }) => void

type onNotification = (data: {
  type:
    | "message"
    | "friend-request"
    | "new-message" 
    | "like-post"
    | "comment-post"
    | "accept-friend"
  username: string
  picture: string
  toUser?: Types.ObjectId
  path: string
}) => void

interface ServerToClientEvents {
  message: onMessageType
  notification: onNotification
}

interface ClientToServerEvents {
  join: onJoinType
  message: onMessageType
}

interface InterServerEvents {
  ping: () => void
}

interface SocketData {
  name: string
  age: number
}

export type {
  onJoinType,
  onMessageType,
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
}
