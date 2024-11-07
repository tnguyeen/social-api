import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

dotenv.config();

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      res.status(403).json({
        success: false,
        message: `Không có quyền truy cập!`,
      });
      return;
    }

    if (token.startsWith("Bearer ")) {
      token = token.replace("Bearer ", "");
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET!);

    req.body.userId = verified;
    next();
  } catch (err) {
    res.status(403).json({
      success: false,
      message: `Không có quyền truy cập!`,
    });
  }
};
