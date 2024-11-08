import { NextFunction, Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import Post from "../../models/PostModel";
import User from "../../models/UserModel";
import { getUserPosts } from "../getPost";

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, caption } = req.body;

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Vui lòng thêm ảnh!",
      });
      return;
    }

    if (!caption) {
      res.status(400).json({
        success: false,
        message: "Vui lòng thêm caption!",
      });
      return;
    }

    const user = await User.findById(userId.id);
    if (!user) {
      res.status(400).json({
        success: false,
        message: `Không có user này!`,
      });
      return;
    }

    const postPicture = await cloudinary.uploader.upload(req.file.path, {
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
    });

    const newPost = new Post({
      userId: userId.id,
      username: user.username,
      profilePic: user.profilePic,
      caption: caption,
      likes: [],
      image: postPicture.url,
    });

    const savedPost = await newPost.save();

    res.status(201).json({
      success: true,
      message: "Đăng bài thành công!",
      data: {
        post: savedPost,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    });
  }
  next();
};

export const getFeedPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId.id);
    if (!user) {
      res.status(400).json({
        success: false,
        message: `Không có user này!`,
      });
      return;
    }

    const posts:any[] = [];

    await Promise.all(
      (user.friends as Array<string>).map(async (friend) => {
        const friendPosts = await getUserPosts(friend)
        posts.push(...friendPosts);
      })
    );

    res.status(200).json({
      success: true,
      message: "Lấy dữ liệu thành công!",
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    });
  }
  next();
};

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, req.body.username + "-post-" + new Date().getTime() + ".png");
  },
});

export const uploadPost = multer({ storage: storage });
