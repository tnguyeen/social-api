import express, { Express, Request, Response } from "express"
import dotenv from "dotenv"
import bp from "body-parser"
import cors from "cors"
import authRoutes from "./routes/authRoute"
import userRoutes from "./routes/userRoute"
// import postRoutes from "./routes/postRoute"
// import messRoutes from "./routes/messRoute"

const app: Express = express()
app.set("view engine", "ejs")
dotenv.config({ path: "./.env" })

app.use(express.json())

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
app.use(cors())

app.get("/", (req: Request, res: Response) => {
  res.send(`Hello`)
})

/* CAC THE LOAI ROUTE */
app.use("/auth", authRoutes)
app.use("/user", userRoutes)
// app.use("/post", postRoutes)
// app.use("/chat", messRoutes)

export default app