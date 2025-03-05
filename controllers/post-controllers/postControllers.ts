import { v2 as cloudinary } from "cloudinary"
import { NextFunction, Request, Response } from "express"
import multer from "multer"
import Post from "../../models/PostModel"
import User from "../../models/UserModel"
import Notification from "../../models/NotificationModel"
import Comment from "../../models/CommentModel"
import { getUserPosts } from "../getPost"
import { Types } from "mongoose"
import { io } from "../../server"

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, caption, username } = req.body

    if (!req.files) {
      res.status(400).json({
        success: false,
        message: "Vui lòng thêm ảnh!",
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

    if (user.username != username) {
      res.status(400).json({
        success: false,
        message: `Không đúng user này!`,
      })
      return
    }

    const files = req.files as Express.Multer.File[]

    const postPictureUrls = await Promise.all(
      files.map(async (file: { path: string }) => {
        const postPicture = await cloudinary.uploader.upload(file.path, {
          cloud_name: process.env.CLOUDINARY_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
          use_filename: true,
          folder: "post-picture",
          secure: true,
          transformation: {
            width: 800,
            height: 800,
            crop: "fill",
            gravity: "auto",
          },
        })

        return postPicture.url
      })
    )

    const newPost = new Post({
      userId: userId.id,
      username: user.username,
      profilePic: user.profilePic,
      caption: caption,
      likes: [],
      image: postPictureUrls,
    })

    const savedPost = await newPost.save()

    res.status(201).json({
      success: true,
      message: "Đăng bài thành công!",
      data: {
        post: savedPost,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    })
  }
  next()
}

export const getFeedPosts = async (
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

    const friends: Types.ObjectId[] = user.friends

    const posts: any[] = []

    const queryPostUserId: string[] = [...friends, userId.id]

    await Promise.all(
      queryPostUserId.map(async (friend) => {
        const friendPosts = await getUserPosts(friend)
        posts.push(...friendPosts)
      })
    )

    res.status(200).json({
      success: true,
      message: "Lấy dữ liệu thành công!",
      data: posts,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    })
  }
  next()
}

export const getPostById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body
    const { postId } = req.params

    const user = await User.findById(userId.id)
    if (!user) {
      res.status(400).json({
        success: false,
        message: `Không có user này!`,
      })
      return
    }

    const post = await Post.findById(postId)

    if (!post) {
      res.status(400).json({
        success: false,
        message: `Không có post này!`,
      })
      return
    }

    const userPosted = await User.findById(post.userId)

    const comments = await Comment.find({
      postId: post._id,
    }).sort({ createdAt: -1 })
    const postData = (post as any)._doc

    if (
      userPosted?.friends.includes(user._id) ||
      String(userPosted?._id) == String(user._id)
    ) {
      res.status(200).json({
        success: true,
        message: "Lấy dữ liệu thành công!",
        data: { ...postData, comments },
      })
    } else {
      res.status(400).json({
        success: false,
        message: "Not friend!",
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    })
  }
  next()
}

export const reactionPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, postId } = req.body

    const user = await User.findById(userId.id)
    if (!user) {
      res.status(400).json({
        success: false,
        message: `Không có user này!`,
      })
      return
    }

    const post = await Post.findById(postId)
    if (!post) {
      res.status(400).json({
        success: false,
        message: `Không có post này!`,
      })
      return
    }

    const likedUserIds = post.likes

    const userPosted = await User.findById(post.userId)

    if (likedUserIds.includes(user.username)) {
      const index = likedUserIds.indexOf(user.username)
      likedUserIds.splice(index, 1)
    } else {
      likedUserIds.push(user.username)

      io.to(String(userPosted?.username)).emit("notification", {
        type: "like-post",
        username: user.username,
        picture: user.profilePic,
        path: String(post._id),
      })

      const noti = new Notification({
        type: "like-post",
        username: user.username,
        picture: user.profilePic,
        path: String(post._id),
        isRead: false,
        userId: userPosted!._id,
      })

      await noti.save()
    }

    post.likes = likedUserIds
    await post.save()

    res.status(200).json({
      success: true,
      message: "Lấy dữ liệu thành công!",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    })
  }
  next()
}

export const commentPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, postId, content } = req.body

    const user = await User.findById(userId.id)
    if (!user) {
      res.status(400).json({
        success: false,
        message: `Không có user này!`,
      })
      return
    }

    const post = await Post.findById(postId)
    if (!post) {
      res.status(400).json({
        success: false,
        message: `Không có post này!`,
      })
      return
    }

    if (!content) {
      res.status(400).json({
        success: false,
        message: `Thêm comment!`,
      })
      return
    }

    const userPosted = await User.findById(post.userId)

    const newComment = new Comment({
      postId,
      userId: user._id,
      username: user.username,
      userProfilePic: user.profilePic,
      content,
    })

    const savedComment = await newComment.save()

    io.to(String(userPosted?.username)).emit("notification", {
      type: "comment-post",
      username: user.username,
      picture: user.profilePic,
      path: String(post._id),
    })

    const noti = new Notification({
      type: "comment-post",
      username: user.username,
      picture: user.profilePic,
      path: String(post._id),
      isRead: false,
      userId: userPosted!._id,
    })

    await noti.save()

    res.status(200).json({
      success: true,
      message: "Lấy dữ liệu thành công!",
      data: savedComment,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    })
  }
  next()
}

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(
      null,
      req.body.username +
        "-post-" +
        new Date().getTime() +
        `-${file.originalname}-` +
        ".png"
    )
  },
})

export const uploadPost = multer({ storage: storage })
