import express from "express";
import { postSchema } from "../validations/postSchema.validator.js";
import { commentSchema } from "../validations/comment.validator.js";
import * as postController from "../controllers/post.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.post("/", auth,validate(postSchema), postController.createPost);
router.get("/", postController.getAllPosts);
router.post("/:id/like", auth, postController.likePost);
router.post("/:id/comment", auth,validate(commentSchema), postController.commentOnPost);

export const PostRoutes = router;