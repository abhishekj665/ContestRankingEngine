import ExpressError from "../utils/ExpressError.util.js";
import prisma from "./prisma.js";

const categories = [
  "Technology",
  "Education",
  "Sports",
  "Entertainment",
  "Travel",
  "Food",
  "Fashion",
  "Fitness",
  "Business",
  "Lifestyle",
];

export const comparePosts = (firstPost, secondPost) => {
  if (secondPost.score !== firstPost.score) {
    return secondPost.score - firstPost.score;
  }

  if (secondPost.commentCount !== firstPost.commentCount) {
    return secondPost.commentCount - firstPost.commentCount;
  }

  if (secondPost.viewCount !== firstPost.viewCount) {
    return secondPost.viewCount - firstPost.viewCount;
  }

  return new Date(firstPost.createdAt) - new Date(secondPost.createdAt);
};

export const buildGlobalRanking = (scoredPosts) => {
  const bestPostsByUser = {};

  for (const post of scoredPosts) {
    const userId = post.userId;
    const currentBestPost = bestPostsByUser[userId];

    if (!currentBestPost || comparePosts(post, currentBestPost) < 0) {
      bestPostsByUser[userId] = post;
    }
  }

  const globalRanking = [];

  for (const userId in bestPostsByUser) {
    globalRanking.push({
      userId,
      bestPost: bestPostsByUser[userId],
    });
  }

  globalRanking.sort((firstUser, secondUser) => {
    return comparePosts(firstUser.bestPost, secondUser.bestPost);
  });

  return globalRanking;
};

export const buildCategoryRankings = (scoredPosts) => {
  const bestPostsByUserAndCategory = {};
  const categoryRankings = {};

  for (const category of categories) {
    categoryRankings[category] = [];
  }

  for (const post of scoredPosts) {
    const userId = post.userId;
    const category = post.category;
    const userCategoryKey = `${userId}-${category}`;
    const currentBestPost = bestPostsByUserAndCategory[userCategoryKey];

    if (!currentBestPost || comparePosts(post, currentBestPost) < 0) {
      bestPostsByUserAndCategory[userCategoryKey] = post;
    }
  }

  for (const userCategoryKey in bestPostsByUserAndCategory) {
    const bestPost = bestPostsByUserAndCategory[userCategoryKey];

    categoryRankings[bestPost.category].push({
      userId: bestPost.userId,
      bestPost,
    });
  }

  for (const category of categories) {
    categoryRankings[category].sort((firstUser, secondUser) => {
      return comparePosts(firstUser.bestPost, secondUser.bestPost);
    });
  }

  return categoryRankings;
};

export const buildConsistencyRanking = (weeklyTopThreeData) => {
  const consistencyRanking = [];

  for (const userWeeklyData of weeklyTopThreeData) {
    const weeks = userWeeklyData.weeks;
    let hasThreePostsInEveryWeek = true;
    let totalScore = 0;

    for (const week of weeks) {
      if (week.postCount < 3) {
        hasThreePostsInEveryWeek = false;
        break;
      }

      totalScore += week.weekScore;
    }

    if (weeks.length !== 4) {
      hasThreePostsInEveryWeek = false;
    }

    if (hasThreePostsInEveryWeek) {
      consistencyRanking.push({
        userId: userWeeklyData.userId,
        score: totalScore,
        weeks,
      });
    }
  }

  consistencyRanking.sort((firstUser, secondUser) => {
    return secondUser.score - firstUser.score;
  });

  return consistencyRanking;
};

export const saveRankingRun = async (snapshot) => {
  try {
    const rankingRun = await prisma.rankingRun.create({
      data: { snapshot },
    });

    return {
      success: true,
      status: 201,
      data: rankingRun,
      message: "Ranking run created successfully",
    };
  } catch (error) {
    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};

export const getLatestRankingRun = async () => {
  try {
    const rankingRun = await prisma.rankingRun.findFirst({
      orderBy: { runAt: "desc" },
    });

    if (!rankingRun) {
      throw new ExpressError(404, "Ranking run not found");
    }

    return {
      success: true,
      status: 200,
      data: rankingRun,
      message: "Latest ranking run fetched successfully",
    };
  } catch (error) {
    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};

export const getRankingRunById = async (rankingRunId) => {
  try {
    const rankingRun = await prisma.rankingRun.findUnique({
      where: { id: rankingRunId },
    });

    if (!rankingRun) {
      throw new ExpressError(404, "Ranking run not found");
    }

    return {
      success: true,
      status: 200,
      data: rankingRun,
      message: "Ranking run fetched successfully",
    };
  } catch (error) {
    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};
