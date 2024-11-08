import express from "express";
import { verifyUser } from "../middlewares/auth";
import { createPost, getFeedPosts, uploadPost } from "../controllers/post-controllers/postControllers";

const router = express.Router();

router.route("/").get(verifyUser, getFeedPosts);
router.route("/createPost").post(uploadPost.single("postImage"),verifyUser, createPost);

export default router;
