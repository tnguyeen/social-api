import dotenv from "dotenv"
import mongoose from "mongoose"
import app from "./app"
import http from "http"
import { Server } from "socket.io"
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./@type/SocketType"
import ioHandler from "./socket/eventHandler"

dotenv.config({ path: "./.env" })

const DB: string = process.env.DATABASE!
const port = process.env.PORT || 8000
const APP_URL = process.env.APP_URL

const server = http.createServer(app)
export const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: APP_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
})

io.on("connection", ioHandler)

mongoose
  .connect(DB!)
  .then(() => {
    server.listen(port, () => {
      console.log(`Server port : ${port}`)
    })
  })
  .catch((err) => {
    console.log(err)
  })
