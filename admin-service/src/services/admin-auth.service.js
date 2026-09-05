import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import ExpressError from "../utils/ExpressError.util.js";
import prisma from "./prisma.js";

export const loginAdmin = async (email, password) => {
  try {
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      throw new ExpressError(401, "Invalid email or password");
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordCorrect) {
      throw new ExpressError(401, "Invalid email or password");
    }

    const token = jwt.sign({ adminId: admin.id }, env.ADMIN_JWT_SECRET, {
      expiresIn: "8h",
    });

    return {
      success: true,
      status: 200,
      data: { token },
      message: "Admin login successful",
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};
