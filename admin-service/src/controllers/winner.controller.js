import * as allocationService from "../services/allocation.service.js";
import prisma from "../services/prisma.js";
import { errorResponse, successResponse } from "../utils/response.util.js";

export const allocateWinner = async (req, res, next) => {
  try {
    const response = await allocationService.allocateWinner(req.body);
    if (response.success) {
      return successResponse(res, response.data, response.message, response.status);
    }
    return errorResponse(res, response.message, response.status);
  } catch (error) {
    next(error);
  }
};

export const getWinners = async (req, res, next) => {
  try {
    const where = {
      status: { notIn: ["FAILED", "REMOVED"] },
    };

    if (req.query.tier) {
      where.tier = req.query.tier;
    }

    const winners = await prisma.winner.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return successResponse(res, winners, "Winners fetched successfully", 200);
  } catch (error) {
    next(error);
  }
};
