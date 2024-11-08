import express from "express";
import { verifyUser } from "../middlewares/auth";
import {
  getMyFriendRequest,
  getUser,
  handleFriendRequest,
  sendFriendRequestUsername,
  unfriendUsername,
} from "../controllers/user-controllers/userControllers";

const router = express.Router();

router.route("/getUser/:targetUsername").get(verifyUser, getUser);
router
  .route("/sendFriendRequest/:targetUsername")
  .post(verifyUser, sendFriendRequestUsername);
router.route("/unfriend/:targetUsername").post(verifyUser, unfriendUsername);
router.route("/friendRequests").get(verifyUser, getMyFriendRequest);
router.route("/handleFriendRequest").post(verifyUser, handleFriendRequest);

export default router;
