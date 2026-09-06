import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import multer from "multer";
import ExpressError from "../utils/ExpressError.util.js";

export const uploadDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../uploads",
);
const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, callback) =>
    callback(
      null,
      `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`,
    ),
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/"))
    return callback(null, true);
  callback(new ExpressError(400, "Only image and video files can be uploaded"));
};

export const uploadPostMedia = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("media");
