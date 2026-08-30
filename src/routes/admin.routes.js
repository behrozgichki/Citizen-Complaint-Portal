import express from "express";

import authenticateUser from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/admin.middleware.js";

import {
  getAllUsers,
  getUserById,
  changeUserRole,
  deleteUser,
} from "../controllers/admin.controllers.js";

const router = express.Router();

// Every route below requires authentication AND admin role

router.get(
  "/users",
  authenticateUser,
  requireAdmin,
  getAllUsers
);

router.get(
  "/users/:id",
  authenticateUser,
  requireAdmin,
  getUserById
);

router.patch(
  "/users/:id/role",
  authenticateUser,
  requireAdmin,
  changeUserRole
);

router.delete(
  "/users/:id",
  authenticateUser,
  requireAdmin,
  deleteUser
);

export default router;