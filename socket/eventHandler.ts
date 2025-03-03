import { Socket } from "socket.io"
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../@type/SocketType"
import jwt from "jsonwebtoken"

const ioHandler = (
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) => {
  socket.on("join", (data) => {
    const { username, room } = data
    socket.join([username, room || jwt.sign(`error`, process.env.JWT_SECRET!)])
  })

  socket.on("message", (data) => {
    const { content, room, senderUsername } = data
    socket.to(data.room).emit("message", { content, room, senderUsername })
  })

  socket.on("disconnect", () => {})
}

export default ioHandler
