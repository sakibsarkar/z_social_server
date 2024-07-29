import express from "express";

import { login, logout, signup } from "../controller/auth.controller";

const router = express.Router();
router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

const authRoute = router;

export default authRoute;
