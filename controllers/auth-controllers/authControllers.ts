import { NextFunction, Request, Response } from "express";
import User from "../../models/UserModel";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcrypt";
import { usernameSchema,zodCheck } from "./schemaChecks";


const salt = bcrypt.genSaltSync(20);

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password, confirmPassword } = req.body;

    if (!username) {
      res.status(400).json({
        status: "failed",
        message: "Vui lòng nhập tên đăng nhập!",
      });
      return
    }

    if (!password) {
      res.status(400).json({
        status: "failed",
        message: "Vui lòng nhập tên mật khẩu!",
      });
      return
    }

    const usernameCheck = zodCheck(username, usernameSchema)
    if(!usernameCheck.success){
      res.status(400).json({
        status: "failed",
        message: usernameCheck.message,
      });
      return
    }


    // return

    // if (!resultCheckUsername.success) {
    //   const zodError = JSON.parse(resultCheckUsername.error.message);
    //   res.status(400).json({
    //     status: "failed",
    //     message: zodError[0].message,
    //   });
    //   return
    // }

    if (password != confirmPassword) {
      res.status(400).json({
        status: "failed",
        message: "Xác nhận sai mật khẩu!",
      });
      return
    }

    const user = await User.findOne({ username: username });

    if (user) {
      res.status(400).json({
        status: "failed",
        message: "Tên đăng nhập đã tồn tại!",
      });
      return
    }

    const profilePicture = await cloudinary.uploader.upload(req.file!.path, {
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

    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username: username,
      password: hashedPassword,
      followers: [],
      following: [],
      profilePic: profilePicture.url,
      posts: [],
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      status: "Đăng kí thành công!",
      data: {
        user: savedUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail to regist",
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
    const user = await User.findOne({ username: username });
    if (!user) {
      res.status(400).json({
        status: "failed",
        mess: `Không có user này!`,
      });
    }
    const abc = bcrypt.compareSync(
      "ngu12i3",
      "$2b$10$CuI47sBfmR2XXY59XazNU.I/VWXYLHmdQnUOwjYVIHRZlWmU.bIM6"
    );
    console.log(abc);
  } catch (error) {
    res.status(400).json({
      status: "fail to regist",
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
