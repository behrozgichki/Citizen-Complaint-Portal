import express from "express";

import {
  generateOfficerSummary,
} from "../controllers/ai.controllers.js";

import authenticateUser from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/admin.middleware.js";

const router = express.Router();

router.post(
  "/officer-summary",
  authenticateUser,
  requireAdmin,
  generateOfficerSummary
);

export default router;