import express from "express"
import { verifyUser } from "../middlewares/auth"
import {
  getMyFriendRequest,
  getUser,
  handleFriendRequest,
  sendFriendRequestUsername,
  unfriendUsername,
  searchUser,
  searchFriendRequest,
  cancelFriendRequest,
  getUserFriend,
} from "../controllers/user-controllers/userControllers"

const router = express.Router()

router.route("/search/:includeString").get(verifyUser, searchUser)
router.route("/getUserFriend").get(verifyUser, getUserFriend)

router.route("/getUser/:targetUsername").get(verifyUser, getUser)

router
  .route("/sendFriendRequest/:targetUsername")
  .post(verifyUser, sendFriendRequestUsername)

router.route("/unfriend/:targetUsername").post(verifyUser, unfriendUsername)
router.route("/cancelFriendRequest").post(verifyUser, cancelFriendRequest)

router
  .route("/searchFriendRequest/:targetUsername")
  .get(verifyUser, searchFriendRequest)

router.route("/friendRequests").get(verifyUser, getMyFriendRequest)
router.route("/handleFriendRequest").post(verifyUser, handleFriendRequest)

export default router
