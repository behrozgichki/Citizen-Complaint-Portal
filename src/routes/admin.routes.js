import express from "express";

import {
  getAllUsers,
  deleteUser,
  updateUserRole,
} from "../controllers/admin.controllers.js";

import {
  authenticateUser,
  authorizeAdmin,
} from "../controllers/users.controllers.js";

const router = express.Router();

router.get(
  "/users",
  authenticateUser,
  authorizeAdmin,
  getAllUsers
);

router.delete(
  "/users/:id",
  authenticateUser,
  authorizeAdmin,
  deleteUser
);

router.patch(
  "/users/:id/role",
  authenticateUser,
  authorizeAdmin,
  updateUserRole
);

export default router;