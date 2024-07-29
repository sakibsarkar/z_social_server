import express from "express";

import {
  deleteMessage,
  getMessages,
  sendMessageController,
} from "../controller/message.controller";
import { isAuthenticatedUser } from "../middlewares/auth";

const router = express.Router();

router.get("/get/:id", isAuthenticatedUser, getMessages);
router.post("/send/:id", isAuthenticatedUser, sendMessageController);
router.delete("/delete/:messageId", isAuthenticatedUser, deleteMessage);

const messageRoute = router;

export default messageRoute;
