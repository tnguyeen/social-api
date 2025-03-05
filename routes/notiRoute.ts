import express from "express"
import { verifyUser } from "../middlewares/auth"
import {
  getAllNotification,
  deleteAllNotification,
  readAllNotification,
} from "../controllers/noti-controllers/notificationControllers"

const router = express.Router()

router.route("/").get(verifyUser, getAllNotification)
router.route("/").post(verifyUser, readAllNotification)
router.route("/").delete(verifyUser, deleteAllNotification)

export default router
