import Complaint from "../models/complaints.model.js";

// ==========================
// PRIORITY HELPER
// ==========================

const calculatePriorityScore = (complaint) => {
  const createdAt = new Date(complaint.createdAt);

  const now = new Date();

  const daysSinceCreated = Math.floor(
    (now - createdAt) / (1000 * 60 * 60 * 24)
  );

  return (
    (complaint.upvotes || 0) * 2 +
    Math.max(daysSinceCreated, 0)
  );
};

const calculatePriority = (complaint) => {
  const score = calculatePriorityScore(complaint);

  if (score > 30) {
    return "Critical";
  }

  if (score >= 16) {
    return "High";
  }

  if (score >= 5) {
    return "Medium";
  }

  return "Low";
};


// ==========================
// CREATE COMPLAINT
// ==========================

const createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      area,
      imageUrl,
      latitude,
      longitude,
    } = req.body;

    // ==========================
    // VALIDATION
    // ==========================

    if (!title?.trim()) {
      return res.status(400).json({
        message: "title is required",
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        message: "description is required",
      });
    }

    if (!category) {
      return res.status(400).json({
        message: "category is required",
      });
    }

    if (!area?.trim()) {
      return res.status(400).json({
        message: "area is required",
      });
    }

    const userId =
      req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message:
          "User ID missing from authentication token",
      });
    }

    // ==========================
    // DUPLICATE DETECTION
    // ==========================

    const normalizedTitle =
      title.trim().toLowerCase();

    const normalizedArea =
      area.trim().toLowerCase();

    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(
      thirtyDaysAgo.getDate() - 30
    );

    const possibleDuplicates =
      await Complaint.find({
        category,
        createdAt: {
          $gte: thirtyDaysAgo,
        },
        status: {
          $ne: "Resolved",
        },
      });

    const duplicate =
      possibleDuplicates.find(
        (existingComplaint) => {
          const existingTitle =
            existingComplaint.title
              ?.trim()
              .toLowerCase() || "";

          const existingArea =
            existingComplaint.area
              ?.trim()
              .toLowerCase() || "";

          const sameArea =
            existingArea ===
            normalizedArea;

          const exactTitle =
            existingTitle ===
            normalizedTitle;

          const newWords =
            normalizedTitle
              .split(/\s+/)
              .filter(
                (word) =>
                  word.length > 2
              );

          const existingWords =
            existingTitle
              .split(/\s+/)
              .filter(
                (word) =>
                  word.length > 2
              );

          const matchingWords =
            newWords.filter((word) =>
              existingWords.includes(word)
            );

          const similarity =
            newWords.length > 0
              ? matchingWords.length /
              newWords.length
              : 0;

          const similarTitle =
            similarity >= 0.6;

          return (
            sameArea &&
            (
              exactTitle ||
              similarTitle
            )
          );
        }
      );

    // ==========================
    // DUPLICATE FOUND
    // ==========================

    if (duplicate) {
      return res.status(409).json({
        message:
          "A similar complaint already exists in this area.",

        duplicate: true,

        existingComplaint: {
          id: duplicate._id,
          title: duplicate.title,
          category:
            duplicate.category,
          area: duplicate.area,
          status: duplicate.status,
          upvotes:
            duplicate.upvotes || 0,
          priority:
            calculatePriority(
              duplicate
            ),
        },
      });
    }

    // ==========================
    // CREATE NEW COMPLAINT
    // ==========================

    const complaint =
      await Complaint.create({
        title: title.trim(),

        description:
          description.trim(),

        category,

        area: area.trim(),

        imageUrl:
          imageUrl?.trim() || "",
        latitude:
          latitude !== undefined && latitude !== null
            ? Number(latitude)
            : null,

        longitude:
          longitude !== undefined && longitude !== null
            ? Number(longitude)
            : null,
        createdBy: userId,
      });

    return res.status(201).json({
      message:
        "complaint submitted successfully",

      duplicate: false,

      data: {
        ...complaint.toObject(),
        priority:
          calculatePriority(complaint),
      },
    });
  } catch (error) {
    console.log(
      "CREATE COMPLAINT ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "failed to create complaint",

      error: error.message,
    });
  }
};

// ==========================
// GET ALL COMPLAINTS
// ==========================

const getAllComplaints = async (req, res) => {
  try {
    const {
      search,
      category,
      status,
      area,
    } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    if (area) {
      filter.area = {
        $regex: area,
        $options: "i",
      };
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          area: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const complaints = await Complaint.find(filter);
    const currentUserId =
      req.user?._id ||
      req.user?.id ||
      req.user?.userId;

   const complaintsWithPriority =
  complaints.map((complaint) => {
    const complaintObject =
      complaint.toObject();

    const createdAt =
      new Date(complaintObject.createdAt);

    const now = new Date();

    const daysSinceCreated =
      Math.max(
        0,
        Math.floor(
          (now - createdAt) /
            (1000 * 60 * 60 * 24)
        )
      );

    const priorityScore =
      Number(complaintObject.upvotes || 0) * 2 +
      daysSinceCreated;

    let priority = "Low";

    if (priorityScore > 30) {
      priority = "Critical";
    } else if (priorityScore >= 16) {
      priority = "High";
    } else if (priorityScore >= 5) {
      priority = "Medium";
    }

    // Check whether current user has upvoted
    const hasUpvoted = currentUserId
      ? (complaintObject.upvotedBy || []).some(
          (userId) =>
            userId.toString() ===
            currentUserId.toString()
        )
      : false;

    return {
      ...complaintObject,
      priority,
      priorityScore,
      hasUpvoted,
    };
  });

    // Highest priority complaints first
    complaintsWithPriority.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }

      if (
        Number(b.upvotes || 0) !==
        Number(a.upvotes || 0)
      ) {
        return (
          Number(b.upvotes || 0) -
          Number(a.upvotes || 0)
        );
      }

      return (
        new Date(b.createdAt) -
        new Date(a.createdAt)
      );
    });

    return res.status(200).json({
      message: "complaints fetched successfully",
      count: complaintsWithPriority.length,
      data: complaintsWithPriority,
    });
  } catch (error) {
    console.error(
      "GET ALL COMPLAINTS ERROR:",
      error
    );

    return res.status(500).json({
      message: "failed to fetch complaints",
      error: error.message,
    });
  }
};

// ==========================
// GET MY COMPLAINTS
// ==========================

const getMyComplaints = async (
  req,
  res
) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message:
          "User ID missing from authentication token",
      });
    }

    const complaints =
      await Complaint.find({
        createdBy: userId,
      }).sort({
        createdAt: -1,
      });

    const complaintsWithPriority =
      complaints.map(
        (complaint) => ({
          ...complaint.toObject(),

          priority:
            calculatePriority(
              complaint
            ),
        })
      );

    return res.status(200).json({
      message:
        "your complaints fetched successfully",

      data:
        complaintsWithPriority,
    });
  } catch (error) {
    console.log(
      "GET MY COMPLAINTS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "failed to fetch your complaints",

      error: error.message,
    });
  }
};

// ==========================
// GET SINGLE COMPLAINT
// ==========================

const getComplaintById = async (
  req,
  res
) => {
  try {
    const complaint =
      await Complaint.findById(
        req.params.id
      ).populate(
        "createdBy",
        "email role"
      );

    if (!complaint) {
      return res.status(404).json({
        message:
          "complaint not found",
      });
    }

    return res.status(200).json({
      message:
        "complaint fetched successfully",

      data: {
        ...complaint.toObject(),

        priority:
          calculatePriority(
            complaint
          ),
      },
    });
  } catch (error) {
    console.log(
      "GET COMPLAINT ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "failed to fetch complaint",

      error: error.message,
    });
  }
};

// ==========================
// UPVOTE COMPLAINT
// ==========================
const toggleUpvoteComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;

    const userId =
      req.user?._id ||
      req.user?.id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const complaint =
      await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    // Safety for old complaints
    if (!Array.isArray(complaint.upvotedBy)) {
      complaint.upvotedBy = [];
    }

    const alreadyUpvoted =
      complaint.upvotedBy.some(
        (id) =>
          id.toString() ===
          userId.toString()
      );

    if (alreadyUpvoted) {
      // Remove user's vote
      complaint.upvotedBy =
        complaint.upvotedBy.filter(
          (id) =>
            id.toString() !==
            userId.toString()
        );
    } else {
      // Add user's vote
      complaint.upvotedBy.push(userId);
    }

    // Count always comes from actual voters
    complaint.upvotes =
      complaint.upvotedBy.length;

    await complaint.save();

    return res.status(200).json({
      message: alreadyUpvoted
        ? "Upvote removed"
        : "Complaint upvoted",

      data: {
        _id: complaint._id,
        upvotes: complaint.upvotes,
        hasUpvoted: !alreadyUpvoted,
      },
    });
  } catch (error) {
    console.error(
      "TOGGLE UPVOTE ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to update upvote",
      error: error.message,
    });
  }
};

// ==========================
// OFFICER UPDATE STATUS
// ==========================

const updateComplaintStatus = async (
  req,
  res
) => {
  try {
    const {
      status,
      officerRemark,
    } = req.body;

    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Resolved",
    ];

    if (
      !status ||
      !allowedStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid complaint status",
      });
    }

    const complaint =
      await Complaint.findById(
        req.params.id
      );

    if (!complaint) {
      return res.status(404).json({
        message:
          "Complaint not found",
      });
    }

    complaint.status = status;

    if (
      officerRemark !== undefined
    ) {
      complaint.officerRemark =
        officerRemark.trim();
    }

    // Citizen can give feedback only
    // after complaint is resolved.
    if (status === "Resolved") {
      complaint.feedbackPending =
        complaint.feedbackGiven !== true;
    } else {
      complaint.feedbackPending =
        false;
    }

    await complaint.save();

    return res.status(200).json({
      message:
        "Complaint updated successfully",

      data: {
        ...complaint.toObject(),

        priority:
          calculatePriority(
            complaint
          ),
      },
    });
  } catch (error) {
    console.log(
      "STATUS UPDATE ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update complaint",

      error: error.message,
    });
  }
};

// ==========================
// SUBMIT FEEDBACK
// ==========================

const submitFeedback = async (
  req,
  res
) => {
  try {
    const {
      rating,
      comment,
    } = req.body;

    const numericRating =
      Number(rating);

    if (
      !numericRating ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message:
          "Rating must be between 1 and 5",
      });
    }

    const complaint =
      await Complaint.findById(
        req.params.id
      );

    if (!complaint) {
      return res.status(404).json({
        message:
          "Complaint not found",
      });
    }

    const userId =
      req.user?.id ||
      req.user?._id;

    if (
      complaint.createdBy.toString() !==
      userId?.toString()
    ) {
      return res.status(403).json({
        message:
          "You can only give feedback on your own complaint",
      });
    }

    if (
      complaint.status !==
      "Resolved"
    ) {
      return res.status(400).json({
        message:
          "Feedback can only be submitted after resolution",
      });
    }

    if (
      complaint.feedbackGiven ===
      true
    ) {
      return res.status(400).json({
        message:
          "Feedback has already been submitted",
      });
    }

    complaint.feedbackRating =
      numericRating;

    complaint.feedbackComment =
      comment?.trim() || "";

    complaint.feedbackGiven =
      true;

    complaint.feedbackPending =
      false;

    await complaint.save();

    return res.status(200).json({
      message:
        "Feedback submitted successfully",

      data: {
        ...complaint.toObject(),

        priority:
          calculatePriority(
            complaint
          ),
      },
    });
  } catch (error) {
    console.log(
      "FEEDBACK ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to submit feedback",

      error: error.message,
    });
  }
};

// ==========================
// EXPORTS
// ==========================

export {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
  toggleUpvoteComplaint,
  updateComplaintStatus,
  submitFeedback,

};