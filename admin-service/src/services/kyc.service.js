import ExpressError from "../utils/ExpressError.util.js";
import prisma from "./prisma.js";
import { firstEligible } from "./allocation.service.js";

const getCandidateScore = (candidate) => {
  if (candidate.bestPost) {
    return candidate.bestPost.score;
  }

  return candidate.score;
};

const getRankingForWinner = (winner, snapshot) => {
  if (winner.tier === "GRAND" || winner.tier === "TOP_PERFORMER") {
    return snapshot.globalRanking || [];
  }

  if (
    winner.tier === "CONSISTENCY_1" ||
    winner.tier === "CONSISTENCY_2"
  ) {
    return snapshot.consistencyRanking || [];
  }

  if (!snapshot.categoryRankings) {
    return [];
  }

  return snapshot.categoryRankings[winner.category] || [];
};

export const getReplacementCandidate = (winner, snapshot, excludedUserIds) => {
  const ranking = getRankingForWinner(winner, snapshot);

  return firstEligible(ranking, excludedUserIds);
};

export const markPassed = async (winnerId) => {
  try {
    const winner = await prisma.winner.findUnique({ where: { id: winnerId } });

    if (!winner) {
      throw new ExpressError(404, "Winner not found");
    }

    const updatedWinner = await prisma.winner.update({
      where: { id: winnerId },
      data: { status: "PASSED" },
    });

    return {
      success: true,
      status: 200,
      data: updatedWinner,
      message: "Winner KYC marked as passed successfully",
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};

export const markFailed = async (winnerId) => {
  try {
    const result = await prisma.$transaction(async (transaction) => {
      const winner = await transaction.winner.findUnique({
        where: { id: winnerId },
        include: { rankingRun: true },
      });

      if (!winner) {
        throw new ExpressError(404, "Winner not found");
      }

      if (winner.status === "FAILED") {
        throw new ExpressError(409, "Winner KYC is already marked as failed");
      }

      if (!winner.rankingRun) {
        throw new ExpressError(409, "Winner does not have a ranking run");
      }

      const failedWinner = await transaction.winner.update({
        where: { id: winnerId },
        data: { status: "FAILED" },
      });

      const currentWinners = await transaction.winner.findMany({
        where: { status: { not: "FAILED" } },
      });
      const excludedUserIds = new Set([winner.userId]);

      for (const currentWinner of currentWinners) {
        excludedUserIds.add(currentWinner.userId);
      }

      const snapshot = winner.rankingRun.snapshot;
      const replacementCandidate = getReplacementCandidate(
        winner,
        snapshot,
        excludedUserIds,
      );

      if (!replacementCandidate) {
        console.error("No ranked candidate remains for failed winner", winner.id);
        throw new ExpressError(409, "No eligible replacement candidate remains");
      }

      const replacementWinner = await transaction.winner.create({
        data: {
          userId: replacementCandidate.userId,
          tier: winner.tier,
          category: winner.category,
          score: getCandidateScore(replacementCandidate),
          status: "PENDING_KYC",
          rankingRunId: winner.rankingRunId,
        },
      });

      return { failedWinner, replacementWinner };
    });

    return {
      success: true,
      status: 200,
      data: result,
      message: "Winner KYC marked as failed and replacement allocated successfully",
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};
