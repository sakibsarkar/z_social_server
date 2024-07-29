import { JwtPayload } from "jsonwebtoken";
import catchAsyncError from "../middlewares/catchAsyncErrors";
import User from "../models/user.model";
import sendResponse from "../utils/sendResponse";

export const getChatHeads = catchAsyncError(async (req, res) => {
  const user = req.user as JwtPayload;

  const loggedInUserId = user._id;

  const filteredUsers = await User.find({
    _id: { $ne: loggedInUserId },
  }).select("-password");

  sendResponse(res, {
    data: filteredUsers,
    success: true,
    message: "successfully get message heads",
  });
});
