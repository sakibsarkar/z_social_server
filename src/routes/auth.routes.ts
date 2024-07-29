import express from "express";

import {
  authSateController,
  forgotPassword,
  genereteAccessToken,
  login,
  logout,
  recoverPassword,
  resetPassword,
  signup,
} from "../controller/auth.controller";
import { isAuthenticatedUser } from "../middlewares/auth";

const router = express.Router();
router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);
router.get("/auth-state", isAuthenticatedUser, authSateController);
router.post("/refreshToken", genereteAccessToken);
router.put("/reset-password", isAuthenticatedUser, resetPassword);
router.post("/forgot-password", forgotPassword);
router.put("/recover-password", recoverPassword);
const authRoute = router;

export default authRoute;
