import User from "../models/users.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateAccessToken = (user) => {
  return jwt.sign(
    { email: user.email },
    process.env.ACCESS_JWT_SECRET,
    {
      expiresIn: "6h",
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { email: user.email },
    process.env.REFRESH_JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

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

const bcryptPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "password required",
      });
    }

    const hash = await bcrypt.hash(password, 12);

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

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "user already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const createUser = await User.create({
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "user registered successfully",
      data: {
        id: createUser._id,
        email: createUser.email,
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

export {
  registerUser,
  bcryptPassword,
  checkJWTToken,
  generateAccessToken,
  generateRefreshToken,
};