import User from "../models/users.model.js";

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({
      email: req.user.email,
    });

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "admin access required",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "authorization failed",
    });
  }
};

export default requireAdmin;