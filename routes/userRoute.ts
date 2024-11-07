import express from "express";
import { verifyUser } from "../middlewares/auth";
import { getMyFriendRequest, getUser, sendFriendRequest } from "../controllers/user-controllers/userControllers";

const router = express.Router();

router.route("/getUser/:targetUsername").get(verifyUser, getUser);
router.route("/sendFriendRequest/:targetUsername").post(verifyUser, sendFriendRequest);
router.route("/friendRequests").get(verifyUser, getMyFriendRequest);

export default router;
