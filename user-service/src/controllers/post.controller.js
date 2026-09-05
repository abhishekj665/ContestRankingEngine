import * as postService from "../services/post.service.js";
import { errorResponse, successResponse } from "../utils/response.util.js";

export const createPost = async (req, res, next) => {
  try {
    const response = await postService.createPost(req.body, req.user);
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

export const getAllPosts = async (req, res, next) => {
  try {
    const response = await postService.getAllPosts(req.query);
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
    console.log(req.user);
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
