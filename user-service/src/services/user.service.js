import ExpressError from "../utils/ExpressError.util.js";
import User from "../models/User.model.js";
import { generateToken } from "../utils/token.util.js";

const fail = (error) => {
  if (error.statusCode) throw error;
  if (error.code === 11000)
    throw new ExpressError(
      409,
      "User with this email or username already exists",
    );
  throw new ExpressError(500, error.message || "Internal Server Error");
};

export const registerUser = async (data) => {
  try {
    const { name, email, username, password, residency } = data;
    if (!name || !email || !username || !password || !residency)
      throw new ExpressError(400, "All fields are required");
    if (await User.exists({ $or: [{ email }, { username }] }))
      throw new ExpressError(
        409,
        "User with this email or username already exists",
      );
    const user = await User.create({
      name,
      email,
      username,
      password,
      residency,
    });
    return {
      success: true,
      status: 201,
      data: user._id,
      message: "User registered successfully",
    };
  } catch (error) {
    fail(error);
  }
};

export const loginUser = async (data) => {
  try {
    const { email, username, password } = data;
    if (!(email || username) || !password)
      throw new ExpressError(
        400,
        "Email or username and password are required",
      );
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user || !(await user.comparePassword(password)))
      throw new ExpressError(401, "Invalid credentials");
    return {
      success: true,
      status: 200,
      data: { userId: user._id, token: generateToken(user._id) },
      message: "User logged in successfully",
    };
  } catch (error) {
    fail(error);
  }
};

export const updateResidency = async (userId, residency) => {
  try {
    
    const user = await User.findById(userId);
    if (!user) throw new ExpressError(404, "User not found");
    user.residency = residency;
    await user.save();
    return {
      success: true,
      status: 200,
      data: user,
      message: "Residency updated successfully",
    };
  } catch (error) {
    fail(error);
  }
};
