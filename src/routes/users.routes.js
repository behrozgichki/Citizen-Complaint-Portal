import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  authenticateUser,
  getProfile,
} from "../controllers/users.controllers.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshToken);

router.get(
  "/profile",
  authenticateUser,
  getProfile
);

export default router;