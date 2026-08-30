import User from "../models/users.model.js";

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "users fetched successfully",
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "failed to fetch users",
    });
  }
};

// Get single user
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    return res.status(200).json({
      message: "user fetched successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "failed to fetch user",
    });
  }
};

// Change user role
const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        message: "role is required",
      });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "invalid role",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "you cannot change your own role",
      });
    }

    user.role = role;

    await user.save();

    return res.status(200).json({
      message: "user role updated successfully",
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "failed to update user role",
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "you cannot delete yourself",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      message: "user deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "failed to delete user",
    });
  }
};

export {
  getAllUsers,
  getUserById,
  changeUserRole,
  deleteUser,
};