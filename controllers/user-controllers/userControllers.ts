import { NextFunction, Request, Response } from "express";
import FriendRequest from "../../models/FriendRequestModel";
import User from "../../models/UserModel";

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;
    const { targetUsername } = req.params;

    if (!targetUsername) {
      res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp tên người dùng cần tìm!",
      });
      return;
    }

    const user = await User.findOne({ username: targetUsername });
    if (!user) {
      res.status(400).json({
        success: false,
        message: `Không có user này!`,
      });
      return;
    }

    const { username, email, profilePic, friends } = user;

    const isFriend = Array(friends).includes(userId.id);

    res.status(200).json({
      success: true,
      message: `Lấy thông tin người dùng thành công!`,
      data: {
        username,
        email,
        friends,
        profilePic,
        post: isFriend ? 1 : 0,
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

export const sendFriendRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;
    const { targetUsername } = req.params;

    if (!targetUsername) {
      res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp tên người dùng cần tìm!",
      });
      return;
    }

    const user = await User.findOne({ username: targetUsername });
    if (!user) {
      res.status(400).json({
        success: false,
        message: `Không có user này!`,
      });
      return;
    }

    if (Array(user.friends).includes(userId.id)) {
      res.status(400).json({
        success: false,
        message: `Already Friend!`,
      });
      return;
    }

    const friendRequest = new FriendRequest({
      fromUserId: userId.id,
      toUserId: user._id,
    });

    await friendRequest.save();

    res.status(201).json({
      success: true,
      message: `Đã gửi yêu cầu kết bạn!`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    });
  }
  next();
};

export const getMyFriendRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;

    const friendRequests = await FriendRequest.find({
      toUserId: userId.id,
    });

    const result: any = [];

    await Promise.all(
      friendRequests.map(async (friendRequest) => {
        const user = await User.findById(friendRequest.fromUserId);
        result.push({
          id: friendRequest._id,
          fromUsername: user?.username,
          fromProfilePic: user?.profilePic,
        });
      })
    );

    res.status(200).json({
      success: true,
      message: `Lấy thông tin thành công!`,
      data: { result },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    });
  }
  next();
};

export const handleFriendRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, friendRequestId, accept } = req.body;

    const isAccepted = JSON.parse(accept);

    const friendRequest = await FriendRequest.findById(friendRequestId);
    if (!friendRequest) {
      res.status(400).json({
        success: false,
        message: `Không có friendRequest này!`,
      });
      return;
    }
    console.log(friendRequest);

    if (friendRequest.toUserId !== userId.id) {
      res.status(400).json({
        success: false,
        message: `Không có friendRequest này!`,
      });
      return;
    }

    if (isAccepted) {
      const user1 = await User.findByIdAndUpdate(
        friendRequest.fromUserId,
        { $push: { friends: userId } },
        { new: true }
      );
      const user2 = await User.findByIdAndUpdate(
        friendRequest.toUserId,
        { $push: { friends: friendRequest.fromUserId } },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: `Đã ${isAccepted ? "đồng ý" : "từ chối"} kết bạn!`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    });
  }
  next();
};
