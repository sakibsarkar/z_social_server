import { Router } from "express";

import authRoute from "./auth.routes";
import chatHeadRoute from "./chatHeads.routes";
import messageRoute from "./message.routes";

const router = Router();

const moduleRoute = [
  {
    path: "/message",
    route: messageRoute,
  },
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/chat-heads",
    route: chatHeadRoute,
  },
];

moduleRoute.forEach((route) => router.use(route.path, route.route));

export default router;
