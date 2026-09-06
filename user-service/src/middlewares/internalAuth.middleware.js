import { env } from "../config/env.js";

export const internalAuth = (req, res, next) => {
  const internalKey = req.headers["x-internal-key"];

  if (!internalKey || internalKey !== env.INTERNAL_SERVICE_KEY) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  next();
};
