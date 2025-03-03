import express from "express"
import { verifyUser } from "../middlewares/auth"
import {
  createConversation,
  getConversationById,
  getConversationMessages,
  getConversations,
  sendMessage,
} from "../controllers/chat-controllers/chatControllers"

const router = express.Router()

router.route("/").get(verifyUser, getConversations)
router.route("/createConversation").post(verifyUser, createConversation)

router.route("/getMessages").post(verifyUser, getConversationMessages)
router.route("/getConversation").post(verifyUser, getConversationById)
router.route("/sendMessage").post(verifyUser, sendMessage)

export default router
