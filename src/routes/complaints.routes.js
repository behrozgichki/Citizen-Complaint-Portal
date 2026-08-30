import express from "express";

import authenticateUser from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/admin.middleware.js";

import {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
  upvoteComplaint,
  updateComplaintStatus,
  submitFeedback
} from "../controllers/complaints.controllers.js";

const router = express.Router();


// Public complaint feed
router.get(
  "/",
  getAllComplaints
);


// Citizen's complaints
router.get(
  "/mine",
  authenticateUser,
  getMyComplaints
);


// Get one complaint
router.get(
  "/:id",
  getComplaintById
);


// Citizen creates complaint
router.post(
  "/",
  authenticateUser,
  createComplaint
);


// Citizen upvotes complaint
router.patch(
  "/:id/upvote",
  authenticateUser,
  upvoteComplaint
);


// Officer/Admin updates status
router.patch(
  "/:id/status",
  authenticateUser,
  requireAdmin,
  updateComplaintStatus
);
router.patch(
  "/:id/feedback",
  authenticateUser,
  submitFeedback
);

export default router;