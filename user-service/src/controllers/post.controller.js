import * as postService from "../services/post.service.js";
import { errorResponse, successResponse } from "../utils/response.util.js";
import fs from "node:fs/promises";

export const createPost = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, "A media file is required", 400);
    }

    const media = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const response = await postService.createPost(
      { ...req.body, media, mediaType: req.file.mimetype },
      req.user,
    );
    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        response.status,
      );
    }
    return errorResponse(res, response.message, response.status);
  } catch (error) {
    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
    next(error);
  }
};

export const getAllPosts = async (req, res, next) => {
  try {
    const response = await postService.getAllPosts(req.validatedQuery ?? req.query);
    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        response.status,
      );
    }
    return errorResponse(res, response.message, response.status);
  } catch (error) {
    next(error);
  }
};

export const likePost = async (req, res, next) => {
  try {
    const response = await postService.likePost(req.params.id, req.user);
    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        response.status,
      );
    }
    return errorResponse(res, response.message, response.status);
  } catch (error) {
    next(error);
  }
};

export const commentOnPost = async (req, res, next) => {
  try {
    const response = await postService.commentOnPost(
      req.params.id,
      req.user,
      req.body.content,
    );
    if (response.success) {
      return successResponse(
        res,
        response.data,
        response.message,
        response.status,
      );
    }
    return errorResponse(res, response.message, response.status);
  } catch (error) {
    next(error);
  }
};
