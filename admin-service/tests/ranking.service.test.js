import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/admin";

const {
  buildCategoryRankings,
  buildConsistencyRanking,
  buildGlobalRanking,
  comparePosts,
} = await import("../src/services/ranking.service.js");

const createRankingPost = (commentCount, viewCount, createdAt) => {
  return {
    score: 100,
    commentCount,
    viewCount,
    createdAt,
  };
};

test("post comparator uses comment count as the first tie-break", () => {
  const moreComments = createRankingPost(8, 10, "2026-01-02");
  const fewerComments = createRankingPost(7, 100, "2026-01-01");

  assert.ok(comparePosts(moreComments, fewerComments) < 0);
});

test("post comparator uses view count as the second tie-break", () => {
  const moreViews = createRankingPost(8, 100, "2026-01-02");
  const fewerViews = createRankingPost(8, 90, "2026-01-01");

  assert.ok(comparePosts(moreViews, fewerViews) < 0);
});

test("post comparator uses earlier timestamp as the final tie-break", () => {
  const earlierPost = createRankingPost(8, 100, "2026-01-01");
  const laterPost = createRankingPost(8, 100, "2026-01-02");

  assert.ok(comparePosts(earlierPost, laterPost) < 0);
});

const scoredPosts = [
  {
    postId: "post-1",
    userId: "user-1",
    category: "Technology",
    score: 10,
    commentCount: 2,
    viewCount: 5,
    createdAt: "2026-01-02T00:00:00.000Z",
  },
  {
    postId: "post-2",
    userId: "user-1",
    category: "Education",
    score: 10,
    commentCount: 3,
    viewCount: 1,
    createdAt: "2026-01-03T00:00:00.000Z",
  },
  {
    postId: "post-3",
    userId: "user-2",
    category: "Technology",
    score: 10,
    commentCount: 3,
    viewCount: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

test("global ranking keeps one best post for every user", () => {
  const globalRanking = buildGlobalRanking(scoredPosts);

  assert.equal(globalRanking.length, 2);
  assert.equal(globalRanking[0].userId, "user-2");
  assert.equal(globalRanking[0].bestPost.postId, "post-3");
  assert.equal(globalRanking[1].bestPost.postId, "post-2");
});

test("category ranking keeps one best post per user in each category", () => {
  const categoryRankings = buildCategoryRankings(scoredPosts);

  assert.equal(categoryRankings.Technology.length, 2);
  assert.equal(categoryRankings.Technology[0].userId, "user-2");
  assert.equal(categoryRankings.Education[0].bestPost.postId, "post-2");
  assert.equal(Object.keys(categoryRankings).length, 10);
});

test("consistency ranking requires three posts in every week", () => {
  const weeklyTopThreeData = [
    {
      userId: "user-1",
      weeks: [
        { postCount: 3, weekScore: 10 },
        { postCount: 3, weekScore: 10 },
        { postCount: 3, weekScore: 10 },
        { postCount: 3, weekScore: 10 },
      ],
    },
    {
      userId: "user-2",
      weeks: [
        { postCount: 3, weekScore: 20 },
        { postCount: 2, weekScore: 20 },
        { postCount: 3, weekScore: 20 },
        { postCount: 3, weekScore: 20 },
      ],
    },
  ];

  const consistencyRanking = buildConsistencyRanking(weeklyTopThreeData);

  assert.equal(consistencyRanking.length, 1);
  assert.equal(consistencyRanking[0].userId, "user-1");
  assert.equal(consistencyRanking[0].score, 40);
});

test("consistency ranking excludes a user missing one complete week", () => {
  const weeklyTopThreeData = [
    {
      userId: "qualifying-user",
      weeks: [
        { postCount: 3, weekScore: 10 },
        { postCount: 3, weekScore: 10 },
        { postCount: 3, weekScore: 10 },
        { postCount: 3, weekScore: 10 },
      ],
    },
    {
      userId: "missing-week-user",
      weeks: [
        { postCount: 10, weekScore: 100 },
        { postCount: 10, weekScore: 100 },
        { postCount: 0, weekScore: 0 },
        { postCount: 10, weekScore: 100 },
      ],
    },
  ];

  const consistencyRanking = buildConsistencyRanking(weeklyTopThreeData);

  assert.equal(consistencyRanking.length, 1);
  assert.equal(consistencyRanking[0].userId, "qualifying-user");
});
