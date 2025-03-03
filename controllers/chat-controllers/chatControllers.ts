import { NextFunction, Request, Response } from "express"
import Conversation from "../../models/ConversationModel"
import Message from "../../models/MessageModel"
import User from "../../models/UserModel"

export const createConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, receiverId } = req.body

    const user = await User.findById(userId.id)
    const receiver = await User.findById(receiverId)
    if (!user || !receiver) {
      res.status(400).json({
        success: false,
        message: `Không có user này!`,
      })
      return
    }

    const isConversation = await Conversation.findOne({
      listUserId: { $in: [user._id, receiver._id] },
    })

    if (isConversation) {
      res.status(400).json({
        success: false,
        message: `Existted Conversation!`,
        data: isConversation,
      })
      return
    }

    const newConversation = new Conversation({
      listUserId: [user._id, receiver._id],
      listUsername: [user.username, receiver.username],
      listUserProfilePic: [user.profilePic, receiver.profilePic],
      lastMessageTime: new Date(),
    })

    const savedConversation = await newConversation.save()

    res.status(201).json({
      success: true,
      message: "Thành công!",
      data: savedConversation,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    })
  }
  next()
}

export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body

    const user = await User.findById(userId.id)
    if (!user) {
      res.status(400).json({
        success: false,
        message: `Không có user này!`,
      })
      return
    }

    const conversations = await Conversation.find({
      listUserId: { $in: [user._id] },
    })

    const returnConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const receiverUsername = conversation.listUsername.filter(
          (username) => username != user.username
        )[0]
        const receiverProfilePic = conversation.listUserProfilePic.filter(
          (profilePic) => profilePic != user.profilePic
        )[0]

        const lastMessage = await Message.findOne({
          conversationId: conversation._id,
        })
          .sort({ createdAt: -1 })
          .exec()

        return {
          _id: conversation._id,
          receiverUsername,
          receiverProfilePic,
          lastMessageTime: conversation.lastMessageTime,
        }
      })
    )

    res.status(200).json({
      success: true,
      message: "Xác thực người dùng thành công!",
      data: returnConversations,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    })
  }
  next()
}

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, conversationId, content } = req.body

    if (!content) {
      res.status(400).json({
        success: false,
        message: `Không có content!`,
      })
      return
    }

    if (!conversationId) {
      res.status(400).json({
        success: false,
        message: `Không có conversationId!`,
      })
      return
    }

    const user = await User.findById(userId.id)
    if (!user) {
      res.status(400).json({
        success: false,
        message: `Không có user này!`,
      })
      return
    }

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      res.status(400).json({
        success: false,
        message: `Không có conversation này!`,
      })
      return
    }

    const isUserAuthorize = conversation.listUserId.includes(user._id)
    if (!isUserAuthorize) {
      res.status(403).json({
        success: false,
        message: `Không có user trong conversation này!`,
      })
      return
    }

    const newMessage = new Message({
      senderId: user._id,
      conversationId: conversation._id,
      content,
      isRead: false,
    })

    await newMessage.save()

    conversation.lastMessageTime = new Date()

    await conversation.save()

    res.status(200).json({
      success: true,
      message: "Xác thực người dùng thành công!",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    })
  }
  next()
}

export const getConversationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, conversationId } = req.body

    const user = await User.findById(userId.id)
    if (!user) {
      res.status(400).json({
        success: false,
        message: `Không có user này!`,
      })
      return
    }

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      res.status(400).json({
        success: false,
        message: `Không có conversation này!`,
      })
      return
    }

    const username = conversation.listUsername.filter(
      (username) => username != user.username
    )[0]
    const profilePic = conversation.listUserProfilePic.filter(
      (profilePic) => profilePic != user.profilePic
    )[0]

    const conversations = await Conversation.find({
      listUserId: { $in: [user._id] },
    })

    const returnConversation = { username, profilePic }

    res.status(200).json({
      success: true,
      message: "Xác thực người dùng thành công!",
      data: returnConversation,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    })
  }
  next()
}

export const getConversationMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, conversationId } = req.body

    const user = await User.findById(userId.id)
    if (!user) {
      res.status(400).json({
        success: false,
        message: `Không có user này!`,
      })
      return
    }

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      res.status(400).json({
        success: false,
        message: `Không có conversation này!`,
      })
      return
    }

    const isUserAuthorize = conversation.listUserId.includes(user._id)
    if (!isUserAuthorize) {
      res.status(403).json({
        success: false,
        message: `Không có user trong conversation này!`,
      })
      return
    }

    const otherUsername = conversation.listUsername.filter(
      (username) => username !== user.username
    )[0]

    const messages = await Message.find({
      conversationId: conversation._id,
    })

    const returnMessages = messages.map((message) => {
      const returnMessage = {
        message,
        senderUsername:
          String(message.senderId) === String(user._id)
            ? user.username
            : otherUsername,
      }

      return returnMessage
    })

    res.status(200).json({
      success: true,
      message: "get messages thành công!",
      data: returnMessages,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    })
  }
  next()
}
