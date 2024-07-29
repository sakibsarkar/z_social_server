import { JwtPayload } from "jsonwebtoken";
import catchAsyncError from "../middlewares/catchAsyncErrors";
import User from "../models/user.model";
import sendResponse from "../utils/sendResponse";
import { sendImageToCloudinary } from "../utils/uploadFile";

export const updateUserProfileImage = catchAsyncError(async (req, res) => {
  const file = req.file;
  const user = req.user as JwtPayload;
  if (!file) {
    return sendResponse(res, {
      message: "file not found",
      success: false,
      data: null,
      statusCode: 404,
    });
  }
  const uploadRes: any = await sendImageToCloudinary(file.filename, file.path);
  const url = uploadRes.secure_url as string;
  if (!url) {
    return sendResponse(res, {
      message: "failed to upload image",
      success: false,
      data: null,
      statusCode: 400,
    });
  }
  console.log(user);

  const result = await User.findByIdAndUpdate(
    user._id,
    { image: url },
    { new: true, runValidators: true }
  );

  sendResponse(res, {
    data: result,
    message: "image updated successfully",
    statusCode: 200,
    success: true,
  });
});
export const updateUserInfo = catchAsyncError(async (req, res) => {
  const { body } = req;
  const user = req.user as JwtPayload;
  ["email", "role", "image"].forEach((item) => delete body[item]);

  const result = await User.findByIdAndUpdate(user._id, body, {
    new: true,
    runValidators: true,
  });

  sendResponse(res, {
    data: result,
    message: "user profile updated successfully",
    statusCode: 200,
    success: true,
  });
});
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
