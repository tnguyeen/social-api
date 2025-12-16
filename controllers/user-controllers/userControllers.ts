import { NextFunction, Request, Response } from "express";
import { nonAccentConverter } from "../../helpers";
import FriendRequest from "../../models/FriendRequestModel";
import Post from "../../models/PostModel";
import User from "../../models/UserModel";
import { io } from "../../server";
import Notification from "../../models/NotificationModel";

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

    const { username, email, profilePic, friends } = targetUser;

    if (String(targetUser._id) === userId.id) {
      const posts = await Post.find({ userId: targetUser._id });
      res.status(200).json({
        success: true,
        message: "Lấy thông tin người dùng thành công!",
        data: {
          username,
          email,
          friends,
          friends_count: friends.length,
          profilePic,
          posts,
          toUser: "is-user",
        },
      });
      return;
    }

    const isFriend = friends.includes(userId.id);

    if (isFriend) {
      const posts = await Post.find({ userId: targetUser._id });
      res.status(200).json({
        success: true,
        message: `Lấy thông tin người dùng thành công!`,
        data: {
          userId: targetUser._id,
          username,
          email,
          friends_count: friends.length,
          profilePic,
          posts,
          toUser: "is-friend",
        },
      });
      return;
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { fromUserId: userId.id, toUserId: targetUser._id },
        { fromUserId: targetUser._id, toUserId: userId.id },
      ],
    });

    let relationStatus = "not-friend";
    let requestId = null;

    if (existingRequest) {
      if (String(existingRequest.fromUserId) === userId.id) {
        relationStatus = "already-sent";
        requestId = existingRequest._id;
      } else {
        relationStatus = "received";
        requestId = existingRequest._id;
      }
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin người dùng thành công!",
      data: {
        userId: targetUser._id,
        username,
        email,
        friends_count: friends.length,
        profilePic,
        toUser: relationStatus, // 'not-friend' | 'already-sent' | 'received'
        friendRequestId: requestId,
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

export const sendFriendRequestUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;
    const { targetUsername } = req.params;

    const user = await User.findById(userId.id);
    if (!user) {
      res.status(400).json({
        success: false,
        message: "Vui lòng cung correct token!",
      });
      return;
    }

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

    if (targetUser.friends.includes(userId.id)) {
      res.status(400).json({
        success: false,
        message: `Đã bạn!`,
      });
      return;
    }

    const isFriendRequest = await FriendRequest.find({
      fromUserId: userId.id,
      toUserId: targetUser._id,
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

    io.to(targetUsername).emit("notification", {
      type: "friend-request",
      username: user.username,
      picture: user.profilePic,
      toUser: targetUser._id,
      path: user.username,
    });

    const noti = new Notification({
      type: "friend-request",
      username: user.username,
      picture: user.profilePic,
      path: user.username,
      isRead: false,
      userId: targetUser._id,
    });

    await noti.save();

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

export const cancelFriendRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { friendRequestId } = req.body;

    if (!friendRequestId) {
      res.status(400).json({
        success: false,
        message: "Không tìm thấy lời mời kết bạn!",
      });
      return;
    }

    await FriendRequest.findByIdAndDelete(friendRequestId);

    res.status(200).json({
      success: true,
      status: "Đã hủy lời mời!",
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
      const user = await User.findById(userId.id);
      if (!user) {
        res.status(400).json({
          success: false,
          message: "Vui lòng cung correct token!",
        });
        return;
      }

      const fromUser = await User.findById(friendRequest.fromUserId);
      if (!fromUser) {
        res.status(400).json({
          success: false,
          message: "Vui lòng cung correct token!",
        });
        return;
      }

      user.friends.push(fromUser._id);
      fromUser.friends.push(user._id);

      await user.save();
      await fromUser.save();

      io.to(fromUser.username).emit("notification", {
        type: "accept-friend",
        username: user.username,
        picture: user.profilePic,
        path: user.username,
      });

      const noti = new Notification({
        type: "accept-friend",
        username: user.username,
        picture: user.profilePic,
        path: user.username,
        isRead: false,
        userId: fromUser._id,
      });

      await noti.save();
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

    if (!targetUser.friends.includes(userId.id)) {
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

export const searchUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { includeString } = req.params;
    const { userId } = req.body;

    const searchValue = nonAccentConverter(includeString);

    const users = await User.find({
      username: { $regex: searchValue, $options: "i" },
      verified: true,
    }).then((users) => {
      const data = users.filter((user) => user._id != userId.id);
      return data;
    });

    res.status(200).json({
      success: true,
      message: "Tìm người dùng thành công!",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    });
  }
  next();
};

export const searchFriendRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;
    const { targetUsername } = req.params;

    const targetUser = await User.findOne({
      username: targetUsername,
    });

    if (!targetUser) {
      res.status(400).json({
        success: false,
        message: "Không có người dùng!",
      });
      return;
    }

    const targetUserId = String(targetUser._id);

    const isSentFriendRequest = await FriendRequest.findOne({
      fromUserId: userId.id,
      toUserId: targetUserId,
    });

    if (isSentFriendRequest) {
      res.status(200).json({
        success: true,
        status: "sent",
        data: isSentFriendRequest,
      });
      return;
    }

    const isReceiveFriendRequest = await FriendRequest.findOne({
      fromUserId: targetUserId,
      toUserId: userId.id,
    });

    if (isReceiveFriendRequest) {
      res.status(200).json({
        success: true,
        status: "received",
        data: isReceiveFriendRequest,
      });
      return;
    }

    res.status(200).json({
      success: true,
      status: "not-sent",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    });
  }
  next();
};

export const getUserFriend = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;

    const users = await User.find({
      friends: { $in: [userId.id] },
    });

    res.status(200).json({
      success: true,
      message: "Tìm người dùng thành công!",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `${error}`,
    });
  }
  next();
};
