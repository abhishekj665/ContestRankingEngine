import express from "express";
import { postSchema } from "../validations/postSchema.validator.js";
import { commentSchema } from "../validations/comment.validator.js";
import * as postController from "../controllers/post.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { postQuerySchema } from "../validations/post-query.validator.js";
import { mongoIdParamSchema } from "../validations/id-param.validator.js";
import { uploadPostMedia } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/", auth, uploadPostMedia, validate(postSchema), postController.createPost);
router.get("/", validate(postQuerySchema, "query"), postController.getAllPosts);
router.post(
  "/:id/like",
  auth,
  validate(mongoIdParamSchema, "params"),
  postController.likePost,
);
router.post(
  "/:id/comment",
  auth,
  validate(mongoIdParamSchema, "params"),
  validate(commentSchema),
  postController.commentOnPost,
);

export const PostRoutes = router;
