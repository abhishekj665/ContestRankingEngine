import * as rankingService from "../services/ranking.service.js";
import * as allocationService from "../services/allocation.service.js";
import {
  fetchEligibleUsers,
  fetchScoredPosts,
  fetchWeeklyTopThree,
} from "../clients/userServiceClient.js";
import ExpressError from "../utils/ExpressError.util.js";
import { errorResponse, successResponse } from "../utils/response.util.js";

export const runRanking = async (req, res, next) => {
  try {
    const scoredPostsResponse = await fetchScoredPosts();
    const eligibleUsersResponse = await fetchEligibleUsers();
    const weeklyTopThreeResponse = await fetchWeeklyTopThree();

    if (
      !scoredPostsResponse.success ||
      !eligibleUsersResponse.success ||
      !weeklyTopThreeResponse.success
    ) {
      throw new ExpressError(502, "User Service ranking data could not be fetched");
    }

    const globalRanking = rankingService.buildGlobalRanking(
      scoredPostsResponse.data,
    );
    const categoryRankings = rankingService.buildCategoryRankings(
      scoredPostsResponse.data,
    );
    const consistencyRanking = rankingService.buildConsistencyRanking(
      weeklyTopThreeResponse.data,
    );

    const rankingSnapshot = {
      eligibleUsers: eligibleUsersResponse.data,
      globalRanking,
      categoryRankings,
      consistencyRanking,
    };

    const allocations = allocationService.buildPrizeAllocations(
      globalRanking,
      consistencyRanking,
      categoryRankings,
    );

    rankingSnapshot.allocations = allocations;

    const response = await allocationService.saveRankingRunAndWinners(
      rankingSnapshot,
      allocations,
    );
    if (response.success) {
      return successResponse(res, response.data, response.message, response.status);
    }
    return errorResponse(res, response.message, response.status);
  } catch (error) {
    next(error);
  }
};

export const getLatestRankingRun = async (req, res, next) => {
  try {
    const response = await rankingService.getLatestRankingRun();
    if (response.success) {
      return successResponse(res, response.data, response.message, response.status);
    }
    return errorResponse(res, response.message, response.status);
  } catch (error) {
    next(error);
  }
};

export const getRankingRunById = async (req, res, next) => {
  try {
    const response = await rankingService.getRankingRunById(req.params.rankingRunId);
    if (response.success) {
      return successResponse(res, response.data, response.message, response.status);
    }
    return errorResponse(res, response.message, response.status);
  } catch (error) {
    next(error);
  }
};
