import * as kycService from "../services/kyc.service.js";
import { errorResponse, successResponse } from "../utils/response.util.js";

export const requestKyc = async (req, res, next) => {
  try {
    const response = await kycService.requestKyc(req.params.id);
    return successResponse(res, response.data, response.message, response.status);
  } catch (error) {
    next(error);
  }
};

export const markPassed = async (req, res, next) => {
  try {
    const response = await kycService.markPassed(req.params.id);
    if (response.success) {
      return successResponse(res, response.data, response.message, response.status);
    }
    return errorResponse(res, response.message, response.status);
  } catch (error) {
    next(error);
  }
};

export const markFailed = async (req, res, next) => {
  try {
    const response = await kycService.markFailed(req.params.id);
    if (response.success) {
      return successResponse(res, response.data, response.message, response.status);
    }
    return errorResponse(res, response.message, response.status);
  } catch (error) {
    next(error);
  }
};
