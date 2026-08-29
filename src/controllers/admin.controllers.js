import User from "../models/users.model.js";

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json({
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to fetch users",
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
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (user.email === req.user.email) {
      return res.status(400).json({
        message: "You cannot delete yourself",
      });
    }

    await User.findByIdAndDelete(id);

    return res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to delete user",
    });
  }
};


// Change user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.email === req.user.email) {
      return res.status(400).json({
        message: "You cannot change your own role",
      });
    }

    user.role = role;

    await user.save();

    return res.json({
      message: "User role updated successfully",
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to update user role",
    });
  }
};


export {
  getAllUsers,
  deleteUser,
  updateUserRole,
};