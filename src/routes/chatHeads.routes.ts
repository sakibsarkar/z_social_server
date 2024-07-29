import express from "express";

import { getChatHeads } from "../controller/user.controller";
import { isAuthenticatedUser } from "../middlewares/auth";

const router = express.Router();
router.get("/", isAuthenticatedUser, getChatHeads);

const chatHeadRoute = router;

export default chatHeadRoute;
