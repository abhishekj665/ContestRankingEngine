import * as adminAuthService from "../services/admin-auth.service.js";
import { successResponse } from "../utils/response.util.js";

export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const response = await adminAuthService.loginAdmin(email, password);

    return successResponse(res, response.data, response.message, response.status);
  } catch (error) {
    next(error);
  }
};
