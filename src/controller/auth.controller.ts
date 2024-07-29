import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import catchAsyncError from "../middlewares/catchAsyncErrors";
import User from "../models/user.model";

import {
  createAcessToken,
  createRefreshToken,
  ITokenPayload,
} from "../utils/jwtToken";
import sendMessage from "../utils/sendMessage";
import sendResponse from "../utils/sendResponse";
export const authSateController = catchAsyncError(async (req, res) => {
  const user = req.user;

  res.json({ success: true, message: "User state get", data: user });
});
export const signup = catchAsyncError(async (req, res) => {
  const { body } = req;

  const user = await User.findOne({ username: body.email });

  if (user) {
    return sendResponse(res, {
      success: false,
      data: null,
      message: "A account already exist in this email",
    });
  }

  // HASH PASSWORD HERE
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(body.password, salt);

  // https://avatar-placeholder.iran.liara.run/

  const userPayload = { ...req.body, password: hashedPassword };

  const result = await User.create({
    ...req.body,
    password: hashedPassword,
    userPayload,
  });

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
      success: false,
      data: null,
      message: "No account found on this email",
      statusCode: 404,
    });
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user?.password || ""
  );

  if (!isPasswordCorrect) {
    return sendResponse(res, {
      message: "password didn't matched",
      success: false,
      data: null,
      statusCode: 403,
    });
  }

  const tokenPayload: ITokenPayload = {
    email: user.email,
    id: user._id.toString(),
  };
  const refreshToken = createRefreshToken({
    email: user.email,
    id: user._id,
  });
  const token = createAcessToken(tokenPayload, "1h");
  res.json({
    data: user,
    accessToken: token,
    refreshToken,
    success: true,
    message: "user logged in successfully",
  });
});

export const logout = catchAsyncError((req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
});
export const genereteAccessToken = catchAsyncError(async (req, res) => {
  const getToken = req.header("Authorization");

  if (!getToken)
    return res.status(400).json({ msg: "Invalid Authentication." });

  const refreshToken = getToken.split(" ")[1];
  if (!refreshToken) {
    sendResponse(res, {
      message: "token must be provided",
      success: false,
      data: null,
      statusCode: 400,
    });
  }

  const refreshTokenSecret = process.env.JWT_REFRESH_SECRET as string;

  try {
    const decoded = jwt.verify(refreshToken, refreshTokenSecret);
    const user = (decoded as JwtPayload).user;
    const accessTOkenPayload = {
      email: user.email,
      id: user.id,
      role: user.role,
    };

    const isExistUser = await User.findById(user.id);
    if (!isExistUser) {
      return sendResponse(res, {
        success: false,
        data: null,
        message: "User not found",
        statusCode: 404,
      });
    }

    const newAccessToken = createAcessToken(accessTOkenPayload, "1h");

    sendResponse(res, {
      success: true,
      message: "Successfully retrive access token",
      data: { accessToken: newAccessToken, user: isExistUser },
    });
  } catch (error) {
    console.error("Error decoding or verifying refresh token:", error);
    res.status(403).json({ message: "Invalid refresh token" });
  }
});
// reset password
export const resetPassword = catchAsyncError(async (req: any, res, next) => {
  const { password, oldPassword } = req.body;

  const user = req.user;
  const email = user.email;

  if (!password || !oldPassword) {
    return res.json({
      message: "password, oldPassword => is required",
    });
  }

  const theUser = await User.findOne({ email });
  // check if there no user
  if (!theUser) {
    return sendResponse(res, {
      message: "user not found",
      data: null,
      success: false,
      statusCode: 404,
    });
  }

  // varify old password
  const isOk = await bcrypt.compare(oldPassword, theUser.password as string);
  if (!isOk) {
    return sendResponse(res, {
      message: "password didn't matched",
      data: null,
      success: false,
      statusCode: 403,
    });
  }

  // create new hash password
  const newPass = await bcrypt.hash(password, 10);

  // update the new
  const updatePassword = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        password: newPass,
      },
    }
  );

  res.json({
    message: "password Updated",
    success: true,
    user: { ...updatePassword?.toObject(), password: "****" },
  });
});

// forgot-password controller
export const forgotPassword = catchAsyncError(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: "No user found with this email!" });
  }

  const tokenPayload = {
    email: user.email,
    _id: user._id,
  };

  const token = jwt.sign(
    tokenPayload,
    process.env.JWT_ACCESS_SECRET as string,
    {
      expiresIn: "5m",
    }
  );
  console.log(`${process.env.FRONTEND_BASE_URL}/recover-password/${token}`);

  sendMessage(
    "legendxpro123455@gmail.com",
    email,
    "Reset your password - Meme Canvas",

    `<div style="font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; margin: 0; padding: 0;">
      <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border: 1px solid #ddd;">
          <div style="text-align: center; background-color: #00466a; color: white; padding: 10px;">
              <h1 style="margin: 0;">Password Reset</h1>
          </div>
          <div style="padding: 20px;">
              <p>Hello,</p>
              <p>We received a request to reset your password. Click the button below to reset it.</p>
              <div style="text-align: center; margin: 20px 0;">
                  <a href="${process.env.FRONTEND_BASE_URL}/recover-password/${token}" style="display: inline-block; padding: 10px 20px; background-color: #00466a; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
              </div>
              <p>If you did not request a password reset, please ignore this email.</p>
              <p>Thanks,</p>
              <p>Memes canvas</p>
          </div>
          <div style="text-align: center; background-color: #f1f1f1; color: #555; padding: 10px;">
              <p style="margin: 0;">&copy; 2024 Fresh Blogs. All rights reserved.</p>
          </div>
      </div>
  </div>`
  );

  res.status(200).json({
    success: true,
    message: "Check your email to recover the password",
  });
});

// Resetting new password
export const recoverPassword = catchAsyncError(async (req, res) => {
  const { password } = req.body;
  const getToken = req.header("Authorization");

  if (!getToken) {
    return sendResponse(res, {
      message: "Token is not provided",
      data: null,
      success: false,
    });
  }
  const token = getToken.split(" ")[1];

  if (!token || !password) {
    return res.status(400).json({ error: "Token and password are required" });
  }

  let decoded;

  try {
    const decode: any = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    );

    decoded = decode;
  } catch (error) {
    sendResponse(res, {
      data: null,
      message: "invalid authentication",
      statusCode: 401,
      success: false,
    });
    return;
  }

  if (!decoded)
    return res
      .status(401)
      .json({ success: false, message: "Invalid Authentication." });

  const user = await User.findOne({
    email: decoded.email,
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      data: null,
      message: "User not found",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;

  await User.findByIdAndUpdate(user._id, {
    password: hashedPassword,
  });

  const tokenPayload = {
    email: user.email,
    id: user._id.toString(),
  };

  const accessToken = createAcessToken(tokenPayload, "1h");

  res.status(200).json({
    success: true,
    message: "Password has been successfully reset",
    accessToken,
  });
});
