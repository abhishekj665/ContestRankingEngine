import ExpressError from "../utils/ExpressError.util.js";
import User from "../models/User.model.js";
import { generateToken } from "../utils/token.util.js";

export const registerUser = async (data) => {
  try {
    const { name, email, username, password, residency } = data;

    if (!name || !email || !username || !password || !residency) {
      throw new ExpressError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new ExpressError(
        400,
        "User with this email or username already exists",
      );
    }

    const newUser = await User.create({
      name,
      email,
      username,
      password,
      residency,
    });
    await newUser.save();

    return {
      success: true,
      status: 201,
      data: newUser._id,
      message: "User registered successfully",
    };
  } catch (error) {
    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};

export const loginUser = async (data) => {
  try {
    const { email, username, password } = data;

    if (!(email || username) || !password) {
      throw new ExpressError(500, error.message || "Internal Server Error");
    }
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
      throw new ExpressError(404, "User not found");
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ExpressError(401, "Invalid credentials ");
    }

    const token = generateToken(user._id);
    return {
      success: true,
      status: 200,
      data: { userId: user._id, token },
      message: "User logged in successfully",
    };
  } catch (error) {
    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};

export const updateResidency = async (userId, residency) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ExpressError(404, "User not found");
    }
    user.residency = residency;
    await user.save();
    return {
      success: true,
      status: 200,
      data: user,
      message: "Residency updated successfully",
    };
  } catch (error) {
    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};
