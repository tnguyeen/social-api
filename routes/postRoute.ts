import express from "express"
import {
  commentPost,
  createPost,
  getFeedPosts,
  reactionPost,
  uploadPost,
} from "../controllers/post-controllers/postControllers"
import { verifyUser } from "../middlewares/auth"

const router = express.Router()

router.route("/").get(verifyUser, getFeedPosts)
router
  .route("/createPost")
  .post(uploadPost.array("postImage", 10), verifyUser, createPost)

router.route("/reactionPost").post(verifyUser, reactionPost)
router.route("/commentPost").post(verifyUser, commentPost)

export default router
