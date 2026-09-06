import * as userService from "../services/user.service.js";
import { errorResponse, successResponse } from "../utils/response.util.js";
import { setCookie } from "../services/cookie.service.js";

export const registerUser = async (req, res, next) => {
  try {
    const response = await userService.registerUser(req.body);
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

export const loginUser = async (req, res, next) => {
  try {
    const response = await userService.loginUser(req.body);
    if (response.success) {
      setCookie(res, "token", response.data.token);
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

export const updateResidency = async (req, res, next) => {
  try {
    console.log(req.user)
    const response = await userService.updateResidency(
      req.user,
      req.body.residency,
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

export const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("token");
    return successResponse(res, null, "User logged out successfully", 200);
  } catch (error) {
    next(error);
  }
};
