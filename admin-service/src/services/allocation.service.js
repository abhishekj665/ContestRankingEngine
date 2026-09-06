import { comparePosts } from "./ranking.service.js";
import prisma from "./prisma.js";
import ExpressError from "../utils/ExpressError.util.js";
import { CONTEST_CATEGORIES } from "../config/contest.config.js";

const getCandidateScore = (candidate) => {
  if (candidate.bestPost) {
    return candidate.bestPost.score;
  }

  return candidate.score;
};

const compareCandidates = (firstCandidate, secondCandidate) => {
  if (firstCandidate.bestPost && secondCandidate.bestPost) {
    return comparePosts(firstCandidate.bestPost, secondCandidate.bestPost);
  }

  return getCandidateScore(secondCandidate) - getCandidateScore(firstCandidate);
};

export const firstEligible = (ranking, wonSet, lockedUserIds = new Set()) => {
  for (const candidate of ranking) {
    if (wonSet.has(candidate.userId)) {
      continue;
    }

    if (lockedUserIds.has(candidate.userId)) {
      continue;
    }

    return candidate;
  }

  return null;
};

export const resolveCategoryWinners = (categoryRankings, wonSet) => {
  const currentCandidates = {};
  const lockedUserIds = new Set();
  let hasConflict = true;

  for (const category of CONTEST_CATEGORIES) {
    const ranking = categoryRankings[category] || [];
    const candidate = firstEligible(ranking, wonSet);

    currentCandidates[category] = candidate;
  }

  while (hasConflict) {
    hasConflict = false;

    const categoriesByUser = {};

    for (const category of CONTEST_CATEGORIES) {
      const candidate = currentCandidates[category];

      if (!candidate) {
        continue;
      }

      if (!categoriesByUser[candidate.userId]) {
        categoriesByUser[candidate.userId] = [];
      }

      categoriesByUser[candidate.userId].push(category);
    }

    for (const userId in categoriesByUser) {
      const userCategories = categoriesByUser[userId];

      if (userCategories.length < 2) {
        continue;
      }

      hasConflict = true;

      let strongestCategory = userCategories[0];
      let strongestCandidate = currentCandidates[strongestCategory];

      for (const category of userCategories) {
        const candidate = currentCandidates[category];

        if (compareCandidates(candidate, strongestCandidate) < 0) {
          strongestCategory = category;
          strongestCandidate = candidate;
        }
      }

      lockedUserIds.add(userId);

      for (const category of userCategories) {
        if (category === strongestCategory) {
          continue;
        }

        const ranking = categoryRankings[category] || [];
        const nextCandidate = firstEligible(ranking, wonSet, lockedUserIds);

        currentCandidates[category] = nextCandidate;
      }
    }
  }

  return currentCandidates;
};

const addAllocation = (allocations, candidate, tier, category = null) => {
  if (!candidate) {
    return;
  }

  allocations.push({
    userId: candidate.userId,
    tier,
    category,
    score: getCandidateScore(candidate),
  });
};

export const buildPrizeAllocations = (
  globalRanking,
  consistencyRanking,
  categoryRankings,
) => {
  const wonSet = new Set();
  const allocations = [];

  const grandWinner = firstEligible(globalRanking, wonSet);
  addAllocation(allocations, grandWinner, "GRAND");

  if (grandWinner) {
    wonSet.add(grandWinner.userId);
  }

  const consistencyFirstWinner = firstEligible(consistencyRanking, wonSet);
  addAllocation(allocations, consistencyFirstWinner, "CONSISTENCY_1");

  if (consistencyFirstWinner) {
    wonSet.add(consistencyFirstWinner.userId);
  }

  const consistencySecondWinner = firstEligible(consistencyRanking, wonSet);
  addAllocation(allocations, consistencySecondWinner, "CONSISTENCY_2");

  if (consistencySecondWinner) {
    wonSet.add(consistencySecondWinner.userId);
  }

  let topPerformerCount = 0;

  for (const candidate of globalRanking) {
    if (topPerformerCount === 10) {
      break;
    }

    if (wonSet.has(candidate.userId)) {
      continue;
    }

    addAllocation(allocations, candidate, "TOP_PERFORMER");
    wonSet.add(candidate.userId);
    topPerformerCount += 1;
  }

  const categoryFirstCandidates = resolveCategoryWinners(categoryRankings, wonSet);

  for (const category of CONTEST_CATEGORIES) {
    const candidate = categoryFirstCandidates[category];

    if (!candidate) {
      continue;
    }

    addAllocation(allocations, candidate, "CATEGORY_1ST", category);
    wonSet.add(candidate.userId);
  }

  const categorySecondCandidates = resolveCategoryWinners(categoryRankings, wonSet);

  for (const category of CONTEST_CATEGORIES) {
    const candidate = categorySecondCandidates[category];

    if (!candidate) {
      continue;
    }

    addAllocation(allocations, candidate, "CATEGORY_2ND", category);
    wonSet.add(candidate.userId);
  }

  return allocations;
};

export const allocateWinner = async (data) => {
  const { userId, tier, category = null, score } = data;

  if (!userId || !tier || typeof score !== "number") {
    throw new ExpressError(400, "userId, tier and score are required");
  }

  try {
    const winner = await prisma.winner.create({
      data: { userId, tier, category, score, status: "PENDING_KYC" },
    });

    return {
      success: true,
      status: 201,
      data: winner,
      message: "Winner allocated successfully",
    };
  } catch (error) {
    if (error.code === "P2002") {
      throw new ExpressError(409, "This category award has already been allocated");
    }
    throw error;
  }
};

export const saveRankingRunAndWinners = async (snapshot, allocations) => {
  const result = await prisma.$transaction(async (transaction) => {
    const rankingRun = await transaction.rankingRun.create({
      data: { snapshot },
    });

    const winners = [];

    for (const allocation of allocations) {
      const winner = await transaction.winner.create({
        data: {
          userId: allocation.userId,
          tier: allocation.tier,
          category: allocation.category,
          score: allocation.score,
          status: "PENDING_KYC",
          rankingRunId: rankingRun.id,
        },
      });

      winners.push(winner);
    }

    return { rankingRun, winners };
  });

  return {
    success: true,
    status: 201,
    data: result,
    message: "Ranking run and winners saved successfully",
  };
};
