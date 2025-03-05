import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"
import bp from "body-parser"
import cors from "cors"
import authRoutes from "./routes/authRoute"
import userRoutes from "./routes/userRoute"
import postRoutes from "./routes/postRoute"
import chatRoutes from "./routes/chatRoute"
import notiRoutes from "./routes/notiRoute"

const app: Express = express()
app.set("view engine", "ejs")
dotenv.config({ path: "./.env" })

app.use(express.json())

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(cors())

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Server is live! Dev only.",
  })
})

/* CAC THE LOAI ROUTE */
app.use("/auth", authRoutes)
app.use("/user", userRoutes)
app.use("/post", postRoutes)
app.use("/chat", chatRoutes)
app.use("/notification", notiRoutes)

export default app
