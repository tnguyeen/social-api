import { NextFunction, Request, Response } from "express"
import User from "../../models/UserModel"
import Notification from "../../models/NotificationModel"

export const getAllNotification = async (
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

    const listNotification = await Notification.find({ userId: user._id }).sort(
      { createdAt: -1 }
    )

    res.status(200).json({
      success: true,
      message: "Xác thực người dùng thành công!",
      data: listNotification,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    })
  }
  next()
}

export const readAllNotification = async (
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

    const listNotification = await Notification.find({ userId: user._id })

    await Promise.all(
      listNotification.map(async (notification) => {
        notification.isRead = true
        await notification.save()
      })
    )

    res.status(200).json({
      success: true,
      message: "Xác thực người dùng thành công!",
      data: listNotification,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    })
  }
  next()
}

export const deleteAllNotification = async (
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

    const listNotification = await Notification.find({ userId: user._id })

    await Promise.all(
      listNotification.map(async (notification) => {
        await notification.deleteOne()
      })
    )

    res.status(200).json({
      success: true,
      message: "Xác thực người dùng thành công!",
      data: listNotification,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    })
  }
  next()
}
