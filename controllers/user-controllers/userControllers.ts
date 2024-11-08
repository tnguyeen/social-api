import { NextFunction, Request, Response } from "express";
import FriendRequest from "../../models/FriendRequestModel";
import User from "../../models/UserModel";
import Post from "../../models/PostModel";

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

    const targetUser = await User.findOne({ username: targetUsername });
    if (!targetUser) {
      res.status(400).json({
        success: false,
        message: `Không có user này!`,
      });
      return;
    }

    if (String(targetUser._id) === userId.id) {
      res.status(200).json({
        success: true,
        message: "Lấy thông tin người dùng thành công!",
        data: targetUser,
      });
      return;
    }

    const { username, email, profilePic, friends } = targetUser;

    const isFriend = (friends as Array<String>).includes(userId.id);

    if (!isFriend) {
      res.status(200).json({
        success: true,
        message: "Lấy thông tin người dùng thành công!",
        data: {
          username,
          email,
          friends,
          profilePic,
        },
      });
      return;
    } else {
      const posts = await Post.find({ userId: targetUser._id });
      res.status(200).json({
        success: true,
        message: `Lấy thông tin người dùng thành công!`,
        data: {
          username,
          email,
          friends,
          profilePic,
          posts,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    });
  }
  next();
};

export const sendFriendRequestUsername = async (
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

    const targetUser = await User.findOne({ username: targetUsername });
    if (!targetUser) {
      res.status(400).json({
        success: false,
        message: `Không có user này!`,
      });
      return;
    }

    if (String(targetUser._id) === userId.id) {
      res.status(400).json({
        success: false,
        message: "Bạn không thể kết bạn với chính mình!",
      });
      return;
    }

    if ((targetUser.friends as Array<String>).includes(userId.id)) {
      res.status(400).json({
        success: false,
        message: `Đã bạn!`,
      });
      return;
    }

    const isFriendRequest = await FriendRequest.find({
      fromUserId: userId.id,
      toUserId: String(targetUser._id),
    });
    if (isFriendRequest.length > 0) {
      res.status(400).json({
        success: false,
        message: `Đã gửi yêu cầu kết bạn!`,
      });
      return;
    }

    const friendRequest = new FriendRequest({
      fromUserId: userId.id,
      toUserId: String(targetUser._id),
    });

    await friendRequest.save();

    res.status(201).json({
      success: true,
      message: `Gửi yêu cầu kết bạn thành công!`,
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
        const targetUser = await User.findById(friendRequest.fromUserId);
        result.push({
          id: friendRequest._id,
          fromUsername: targetUser?.username,
          fromProfilePic: targetUser?.profilePic,
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

    if (!accept) {
      res.status(400).json({
        success: false,
        message: `Không có accept field này!`,
      });
      return;
    }

    const isAccepted = JSON.parse(accept);

    const friendRequest = await FriendRequest.findById(friendRequestId);
    if (!friendRequest) {
      res.status(400).json({
        success: false,
        message: `Không có friendRequest này!`,
      });
      return;
    }

    if (String(friendRequest.toUserId) !== userId.id) {
      res.status(400).json({
        success: false,
        message: `Không có friendRequest này!`,
      });
      return;
    }

    if (isAccepted) {
      await User.findByIdAndUpdate(
        friendRequest.fromUserId,
        { $push: { friends: userId.id } },
        { new: true }
      );
      await User.findByIdAndUpdate(
        friendRequest.toUserId,
        { $push: { friends: friendRequest.fromUserId } },
        { new: true }
      );
    }

    await friendRequest.deleteOne();

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

export const unfriendUsername = async (
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

    const targetUser = await User.findOne({ username: targetUsername });
    if (!targetUser) {
      res.status(400).json({
        success: false,
        message: `Không có user này!`,
      });
      return;
    }

    if (!(targetUser.friends as Array<String>).includes(userId.id)) {
      res.status(400).json({
        success: false,
        message: `Không phải bạn!`,
      });
      return;
    }

    await User.findByIdAndUpdate(
      userId.id,
      { $pull: { friends: String(targetUser._id) } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      String(targetUser._id),
      { $pull: { friends: userId.id } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Hủy kết bạn thành công!`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    });
  }
  next();
};
