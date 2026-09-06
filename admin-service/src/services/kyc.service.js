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

export const requestKyc = async (winnerId) => {
  try {
    const result = await prisma.winner.updateMany({
      where: {
        id: winnerId,
        status: "PENDING_KYC",
        kycRequestedAt: null,
      },
      data: { kycRequestedAt: new Date() },
    });

    if (!result.count) {
      const winner = await prisma.winner.findUnique({ where: { id: winnerId } });
      if (!winner) throw new ExpressError(404, "Winner not found");
      throw new ExpressError(409, "KYC was already requested or decided for this winner");
    }

    const winner = await prisma.winner.findUnique({ where: { id: winnerId } });
    return {
      success: true,
      status: 200,
      data: winner,
      message: "KYC request sent successfully",
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};

export const markPassed = async (winnerId) => {
  try {
    const result = await prisma.winner.updateMany({
      where: {
        id: winnerId,
        status: "PENDING_KYC",
        kycRequestedAt: { not: null },
      },
      data: { status: "PASSED" },
    });

    if (!result.count) {
      const winner = await prisma.winner.findUnique({ where: { id: winnerId } });
      if (!winner) throw new ExpressError(404, "Winner not found");
      throw new ExpressError(409, "Send a KYC request before deciding this winner");
    }

    const updatedWinner = await prisma.winner.findUnique({ where: { id: winnerId } });

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

      if (!winner.rankingRun) {
        throw new ExpressError(409, "Winner does not have a ranking run");
      }

      const failureUpdate = await transaction.winner.updateMany({
        where: {
          id: winnerId,
          status: "PENDING_KYC",
          kycRequestedAt: { not: null },
        },
        data: { status: "FAILED" },
      });

      if (!failureUpdate.count) {
        throw new ExpressError(409, "Send a KYC request before deciding this winner");
      }

      const failedWinner = await transaction.winner.findUnique({
        where: { id: winnerId },
      });

      const winnersInRun = await transaction.winner.findMany({
        where: {
          rankingRunId: winner.rankingRunId,
        },
        select: { userId: true },
      });
      const excludedUserIds = new Set([winner.userId]);

      // Failed users remain excluded forever in this run.  Without this, a
      // second failed replacement could re-award the original failed winner.
      for (const runWinner of winnersInRun) {
        excludedUserIds.add(runWinner.userId);
      }

      const snapshot = winner.rankingRun.snapshot;
      const replacementCandidate = getReplacementCandidate(
        winner,
        snapshot,
        excludedUserIds,
      );

      if (!replacementCandidate) {
        // An exhausted category/ranking has no valid backfill.  The failed
        // winner remains removed and the prize is deliberately left vacant.
        return { failedWinner, replacementWinner: null };
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
    }, { isolationLevel: "Serializable" });

    return {
      success: true,
      status: 200,
      data: result,
      message: result.replacementWinner
        ? "Winner KYC marked as failed and replacement allocated successfully"
        : "Winner KYC marked as failed; no eligible replacement remains",
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    if (error.code === "P2002" || error.code === "P2034") {
      throw new ExpressError(409, "Ranking changed concurrently; retry the KYC decision");
    }

    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};
