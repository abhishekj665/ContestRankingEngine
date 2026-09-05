import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/admin";

const { getReplacementCandidate } = await import("../src/services/kyc.service.js");

test("KYC failure finds the next eligible global candidate twice", () => {
  const winner = { tier: "GRAND", category: null };
  const snapshot = {
    globalRanking: [
      { userId: "winner-a", bestPost: { score: 100 } },
      { userId: "winner-b", bestPost: { score: 90 } },
      { userId: "winner-c", bestPost: { score: 80 } },
      { userId: "winner-d", bestPost: { score: 70 } },
    ],
  };
  const firstExcludedUserIds = new Set(["winner-a", "other-current-winner"]);

  const firstReplacement = getReplacementCandidate(
    winner,
    snapshot,
    firstExcludedUserIds,
  );

  assert.equal(firstReplacement.userId, "winner-b");

  const secondExcludedUserIds = new Set([
    "winner-a",
    "winner-b",
    "other-current-winner",
  ]);
  const secondReplacement = getReplacementCandidate(
    winner,
    snapshot,
    secondExcludedUserIds,
  );

  assert.equal(secondReplacement.userId, "winner-c");
});
