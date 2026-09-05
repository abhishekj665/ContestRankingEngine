import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/admin";

const {
  buildPrizeAllocations,
  resolveCategoryWinners,
} = await import("../src/services/allocation.service.js");

const createCandidate = (userId, score, createdAt) => {
  return {
    userId,
    bestPost: {
      score,
      commentCount: 0,
      viewCount: 0,
      createdAt,
    },
  };
};

test("category conflict keeps a user only in their strongest category", () => {
  const categoryRankings = {
    Technology: [
      createCandidate("user-a", 100, "2026-01-01"),
      createCandidate("user-b", 90, "2026-01-02"),
    ],
    Education: [
      createCandidate("user-a", 95, "2026-01-03"),
      createCandidate("user-c", 80, "2026-01-04"),
    ],
  };

  const categoryWinners = resolveCategoryWinners(categoryRankings, new Set());

  assert.equal(categoryWinners.Technology.userId, "user-a");
  assert.equal(categoryWinners.Education.userId, "user-c");
});

test("category conflict resolution keeps independent category winners", () => {
  const categoryRankings = {
    Technology: [createCandidate("user-a", 100, "2026-01-01")],
    Education: [createCandidate("user-b", 90, "2026-01-02")],
  };

  const categoryWinners = resolveCategoryWinners(categoryRankings, new Set());

  assert.equal(categoryWinners.Technology.userId, "user-a");
  assert.equal(categoryWinners.Education.userId, "user-b");
});

test("category conflict resolution handles a chained conflict", () => {
  const categoryRankings = {
    Technology: [
      createCandidate("user-a", 100, "2026-01-01"),
      createCandidate("user-b", 90, "2026-01-02"),
    ],
    Education: [
      createCandidate("user-a", 95, "2026-01-01"),
      createCandidate("user-b", 80, "2026-01-02"),
      createCandidate("user-c", 70, "2026-01-03"),
    ],
    Sports: [
      createCandidate("user-b", 100, "2026-01-01"),
      createCandidate("user-d", 60, "2026-01-02"),
    ],
  };

  const categoryWinners = resolveCategoryWinners(categoryRankings, new Set());

  assert.equal(categoryWinners.Technology.userId, "user-a");
  assert.equal(categoryWinners.Education.userId, "user-c");
  assert.equal(categoryWinners.Sports.userId, "user-b");
});

test("category second place remains unawarded when no candidate remains", () => {
  const categoryRankings = {
    Technology: [
      createCandidate("user-a", 100, "2026-01-01"),
      createCandidate("user-b", 90, "2026-01-02"),
    ],
    Education: [
      createCandidate("user-a", 95, "2026-01-03"),
      createCandidate("user-c", 80, "2026-01-04"),
    ],
  };

  const firstPlaceWinners = resolveCategoryWinners(categoryRankings, new Set());
  const wonSet = new Set([
    firstPlaceWinners.Technology.userId,
    firstPlaceWinners.Education.userId,
  ]);
  const secondPlaceWinners = resolveCategoryWinners(categoryRankings, wonSet);

  assert.equal(secondPlaceWinners.Technology.userId, "user-b");
  assert.equal(secondPlaceWinners.Education, null);
});

test("prize allocation never awards the same user twice", () => {
  const globalRanking = [
    createCandidate("user-a", 100, "2026-01-01"),
    createCandidate("user-b", 90, "2026-01-02"),
    createCandidate("user-c", 80, "2026-01-03"),
  ];
  const consistencyRanking = [
    { userId: "user-a", score: 500 },
    { userId: "user-b", score: 400 },
    { userId: "user-c", score: 300 },
  ];
  const categoryRankings = {
    Technology: [
      createCandidate("user-a", 100, "2026-01-01"),
      createCandidate("user-b", 90, "2026-01-02"),
      createCandidate("user-c", 80, "2026-01-03"),
    ],
  };

  const allocations = buildPrizeAllocations(
    globalRanking,
    consistencyRanking,
    categoryRankings,
  );
  const awardedUserIds = allocations.map((allocation) => allocation.userId);
  const uniqueUserIds = new Set(awardedUserIds);

  assert.equal(awardedUserIds.length, uniqueUserIds.size);
  assert.equal(allocations[0].tier, "GRAND");
  assert.equal(allocations[1].tier, "CONSISTENCY_1");
  assert.equal(allocations[2].tier, "CONSISTENCY_2");
});
