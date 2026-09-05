import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user._id.toString();
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};