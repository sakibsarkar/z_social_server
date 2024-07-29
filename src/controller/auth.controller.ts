import bcrypt from "bcrypt";
import catchAsyncError from "../middlewares/catchAsyncErrors";
import User from "../models/user.model";

import { createAcessToken, ITokenPayload } from "../utils/jwtToken";
import sendResponse from "../utils/sendResponse";

export const signup = catchAsyncError(async (req, res) => {
  const { body } = req;

  const user = await User.findOne({ username: body.email });

  if (user) {
    return res.status(400).json({ error: "Username already exists" });
  }

  // HASH PASSWORD HERE
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(body.password, salt);

  // https://avatar-placeholder.iran.liara.run/

  const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${body.email}`;
  const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${body.email}`;

  const result = await User.create({ ...req.body, password: hashedPassword });

  const { password, ...rest } = result.toObject();

  sendResponse(res, {
    data: rest,
    message: "user created successfully,",
    success: true,
  });
});

export const login = catchAsyncError(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return sendResponse(res, {
      data: null,
      message: "user not found",
      success: false,
    });
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user?.password || ""
  );

  if (!isPasswordCorrect) {
    return sendResponse(res, {
      data: null,
      message: "Invalid email or password",
      success: false,
    });
  }

  const tokenPayload: ITokenPayload = {
    email: user.email,
    id: user._id.toString(),
  };

  const token = createAcessToken(tokenPayload, "1h");
  res.json({
    data: user,
    accessToken: token,
    success: true,
    message: "user logged in successfully",
  });
});

export const logout = catchAsyncError((req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
});
