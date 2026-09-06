import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import prisma from "../services/prisma.js";

export const auth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const authorizationParts = authorization.split(" ");

    if (authorizationParts.length !== 2 || authorizationParts[0] !== "Bearer") {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authorizationParts[1];
    const decoded = jwt.verify(token, env.ADMIN_JWT_SECRET);

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
    });

    if (!admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    req.adminId = admin.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
