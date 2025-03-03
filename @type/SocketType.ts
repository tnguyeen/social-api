type onMessageType = (data: {
  content: string
  room: string
  senderUsername: string
}) => void
type onJoinType = (data: { username: string; room?: string }) => void

interface ServerToClientEvents {
  noArg: () => void
  basicEmit: (a: number, b: string, c: Buffer) => void
  withAck: (d: string, callback: (e: number) => void) => void
  message: onMessageType
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
