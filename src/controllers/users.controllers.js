import User from "../models/users.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    process.env.ACCESS_JWT_SECRET,
    {
      expiresIn: "6h",
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      email: user.email,
      role: user.role,
    },
    process.env.REFRESH_JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// Check JWT Token
const checkJWTToken = (req, res) => {
  const user = {
    email: "mabdullah2037@gmail.com",
  };

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return res.json({
    accessToken,
    refreshToken,
  });
};

// Bcrypt Password Test
const bcryptPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "password required",
      });
    }


    return res.json({
      password: hash,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "something went wrong",
    });
  }
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "email required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "password required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "user already exists",
      });
    }

    const user = await User.create({
      email,
      password,
    });

    return res.status(201).json({
      message: "user registered successfully",

      data: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "something went wrong",
      error: error.message,
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "password required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "password is incorrect",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
    });

  return res.json({
  message: "user loggedIn successfully",

  accessToken,

  refreshToken,

  data: {
    id: user._id,
    email: user.email,
    role: user.role,
  },
});
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "something went wrong",
      error: error.message,
    });
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  try {
    const token =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({
        message: "no refresh token found!",
      });
    }

    // Verify refresh token
    const decodedToken = jwt.verify(
      token,
      process.env.REFRESH_JWT_SECRET
    );

    // Find user
    const user = await User.findOne({
      email: decodedToken.email,
    });

    if (!user) {
      return res.status(404).json({
        message: "invalid token",
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    return res.json({
      message: "access token generated",
      accessToken,
    });
  } catch (error) {
    console.log(error);

    return res.status(401).json({
      message: "invalid or expired refresh token",
    });
  }
};

// Logout User
const logoutUser = async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
  });

  return res.json({
    message: "user logout successfully",
  });
};

// Authenticate User Middleware

const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization header required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token required",
      });
    }

    jwt.verify(
      token,
      process.env.ACCESS_JWT_SECRET,
      (err, user) => {
        if (err) {
          return res.status(403).json({
            message: "Invalid or expired token",
          });
        }

        req.user = user;
        next();
      }
    );
  } catch (error) {
    return res.status(500).json({
      message: "Authentication failed",
    });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
};



const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.user.email,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.log("GET PROFILE ERROR:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export {
  registerUser,
  bcryptPassword,
  checkJWTToken,
  generateAccessToken,
  generateRefreshToken,
  refreshToken,
  loginUser,
  logoutUser,
  authenticateUser,
  getProfile,
  authorizeAdmin
};