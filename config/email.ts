import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

var transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: "tainguyen.pham.133@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "",
  },
})

export default transporter
