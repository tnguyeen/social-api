import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import User from "../../models/UserModel";
import sendMailVerify from "./authMailer";
import {
  emailSchema,
  passwordSchema,
  usernameSchema,
  zodCheck,
} from "./schemaChecks";

const salt = bcrypt.genSaltSync(4);

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password, confirmPassword, email } = req.body;

    if (!username) {
      res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên đăng nhập!",
      });
      return;
    }

    if (!password) {
      res.status(400).json({
        success: false,
        message: "Vui lòng nhập mật khẩu!",
      });
      return;
    }

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Vui lòng nhập địa chỉ email!",
      });
      return;
    }

    const usernameCheck = zodCheck(username, usernameSchema);
    if (!usernameCheck.success) {
      res.status(400).json({
        success: false,
        message: usernameCheck.message,
      });
      return;
    }

    const passwordCheck = zodCheck(password, passwordSchema);
    if (!passwordCheck.success) {
      res.status(400).json({
        success: false,
        message: passwordCheck.message,
      });
      return;
    }

    const emailCheck = zodCheck(email, emailSchema);
    if (!emailCheck.success) {
      res.status(400).json({
        success: false,
        message: emailCheck.message,
      });
      return;
    }

    if (password != confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Xác nhận sai mật khẩu!",
      });
      return;
    }

    const isUsername = await User.findOne({ username: username });
    const isEmail = await User.findOne({ email: email });

    if (isUsername) {
      res.status(400).json({
        success: false,
        message: "Tên đăng nhập đã tồn tại!",
      });
      return;
    }
    if (isEmail) {
      res.status(400).json({
        success: false,
        message: "Địa chỉ email đã tồn tại!",
      });
      return;
    }

    let profilePictureUrl = "";
    if (req.file) {
      const profilePicture = await cloudinary.uploader.upload(req.file.path, {
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        use_filename: true,
        folder: "profile-picture",
        secure: true,
        transformation: {
          width: 400,
          height: 400,
          crop: "fill",
          gravity: "auto",
        },
      });
      profilePictureUrl = profilePicture.url;
    } else {
      profilePictureUrl =
        "https://res.cloudinary.com/dfn0pqcfw/image/upload/v1730864474/default_h0bn9c.webp";
    }

    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username: username,
      password: hashedPassword,
      email: email,
      verify: false,
      followers: [],
      following: [],
      profilePic: profilePictureUrl,
      posts: [],
    });

    const savedUser = await newUser.save();

    sendMailVerify(email, String(savedUser._id));

    res.status(201).json({
      success: true,
      message: "Đăng kí thành công!",
      data: {
        user: savedUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mess: `${error}`,
    });
  }
  next();
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;

    if (!username) {
      res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên đăng nhập!",
      });
      return;
    }

    if (!password) {
      res.status(400).json({
        success: false,
        message: "Vui lòng nhập mật khẩu!",
      });
      return;
    }

    const user = await User.findOne({ username: username });
    if (!user) {
      res.status(400).json({
        success: false,
        mess: `Không có user này!`,
      });
      return;
    }
    const checkPassword = bcrypt.compareSync(password, String(user.password));

    if (checkPassword) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!);
      res.status(200).json({
        success: true,
        message: "Đăng nhập thành công!",
        data: {
          token,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Nhập sai mật khẩu!",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      mess: `${error}`,
    });
  }
  next();
};

export const verifyAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid } = req.params;
    const user = await User.findOneAndUpdate({ _id: uid }, { verified: true });

    if (!user) {
      res.status(400).json({
        success: false,
        mess: `Không có user này!`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Xác thực người dùng thành công!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mess: `${error}`,
    });
  }
  next();
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword) {
      res.status(400).json({
        success: false,
        message: "Vui lòng nhập mật khẩu hiện tại!",
      });
      return;
    }
    if (!newPassword) {
      res.status(400).json({
        success: false,
        message: "Vui lòng nhập mật khẩu mới!",
      });
      return;
    }
    if (!confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Vui lòng xác nhận mật khẩu!",
      });
      return;
    }

    const passwordCheck = zodCheck(newPassword, passwordSchema);
    if (!passwordCheck.success) {
      res.status(400).json({
        success: false,
        message: passwordCheck.message,
      });
      return;
    }

    if (newPassword != confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Xác nhận sai mật khẩu!",
      });
      return;
    }

    const user = await User.findById(userId.id);
    if (!user) {
      res.status(400).json({
        success: false,
        mess: `Không có user này!`,
      });
      return;
    }

    const checkPassword = bcrypt.compareSync(
      currentPassword,
      String(user.password)
    );

    if (!checkPassword) {
      res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng!",
      });
      return;
    }

    const hashedPassword = bcrypt.hashSync(newPassword, salt);
    user.password = hashedPassword;

    await user.save();

    res.status(400).json({
      success: true,
      message: "Thay đổi mật khẩu thành công!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mess: `${error}`,
    });
  }
  next();
};

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, req.body.username + "-" + new Date().getTime() + ".png");
  },
});

export const upload = multer({ storage: storage });
