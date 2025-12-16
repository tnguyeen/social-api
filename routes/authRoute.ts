import express from "express"
import {
  changePassword,
  login,
  otpForgotPassword,
  register,
  uploadProfile,
  verifyAccount,
  changeForgottenPassword,
  checkUsername,
} from "../controllers/auth-controllers/authControllers"
import { verifyUser } from "../middlewares/auth"

const router = express.Router()

router.route("/checkUsername/:username").get(checkUsername)
router.route("/register").post(uploadProfile.single("profilepic"), register)

router.post("/login", login)

router.route("/verify/:uid").get(verifyAccount)
router.route("/changePassword").post(verifyUser, changePassword)
router.route("/resetPassword").post(changePassword)

router.route("/otpForgotPassword").post(otpForgotPassword)
router.route("/changeForgottenPassword").post(changeForgottenPassword)

export default router
