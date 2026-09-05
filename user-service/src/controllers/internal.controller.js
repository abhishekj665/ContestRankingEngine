import * as internalService from "../services/internal.service.js";
import { errorResponse, successResponse } from "../utils/response.util.js";

export const getScoredPosts = async (req, res, next) => {
  try {
    const response = await internalService.getScoredPosts();
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

export const getEligibleUsers = async (req, res, next) => {
  try {
    const response = await internalService.getEligibleUsers();
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

export const getWeeklyTopThree = async (req, res, next) => {
  try {
    const response = await internalService.getWeeklyTopThree();
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
