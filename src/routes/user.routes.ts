import express from "express";

import {
  getChatHeads,
  updateUserInfo,
  updateUserProfileImage,
} from "../controller/user.controller";
import { isAuthenticatedUser } from "../middlewares/auth";
import { upload } from "../utils/uploadFile";

const router = express.Router();
router.get("/", isAuthenticatedUser, getChatHeads);
router.put(
  "/update-profile-image",
  isAuthenticatedUser,
  upload.single("file"),
  updateUserProfileImage
);
router.put("/update", isAuthenticatedUser, updateUserInfo);
const chatHeadRoute = router;

export default chatHeadRoute;
