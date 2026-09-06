import path from "node:path";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import multer from "multer";
import ExpressError from "../utils/ExpressError.util.js";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

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

const uploadSinglePostMedia = multer({
  storage,
  fileFilter,
  // Multer can enforce one stream limit only. Images are checked below after
  // upload; this remains the hard limit for every uploaded media file.
  limits: { fileSize: MAX_VIDEO_SIZE },
}).single("media");

export const uploadPostMedia = (req, res, next) => {
  uploadSinglePostMedia(req, res, async (error) => {
    if (error) return next(error);

    if (req.file?.mimetype.startsWith("image/") && req.file.size > MAX_IMAGE_SIZE) {
      await fs.unlink(req.file.path).catch(() => {});
      return next(new ExpressError(400, "Images must be 10 MB or smaller"));
    }

    next();
  });
};
