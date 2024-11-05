import dotenv from "dotenv"
import mongoose from "mongoose"
import app from "./app"
import http from "http"
// import { Server } from "socket.io"

dotenv.config({ path: "./.env" })

const DB: string = process.env.DATABASE!
const port = process.env.PORT || 8000

const server = http.createServer(app)
// const io = new Server(server, {
//   cors: {
//     origin: "https://dungvaobangdienthoai.vercel.app",
//     // origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//   },
// })

// io.on("connection", (socket) => {
//   socket.on("join", (data) => {
//     socket.join(data)
//   })

//   socket.on("send_message", (data) => {
//     socket.to(data.room).emit("receive_message", data)
//   })

//   socket.on("disconnect", () => {})
// })

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