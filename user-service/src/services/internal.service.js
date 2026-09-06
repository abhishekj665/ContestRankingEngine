import Post from "../models/Post.model.js";
import User from "../models/User.model.js";
import ExpressError from "../utils/ExpressError.util.js";

const scoreFields = {
  score: {
    $add: [
      "$likeCount",
      { $multiply: ["$commentCount", 3] },
      { $multiply: ["$viewCount", 0.2] },
    ],
  },
};

const eligiblePostStages = [
  {
    $lookup: {
      from: "users",
      localField: "author",
      foreignField: "_id",
      as: "author",
    },
  },
  { $unwind: "$author" },
  { $match: { "author.isContestEligible": true } },
  { $addFields: scoreFields },
  {
    $project: {
      _id: 0,
      postId: { $toString: "$_id" },
      userId: { $toString: "$author._id" },
      category: 1,
      likeCount: 1,
      commentCount: 1,
      viewCount: 1,
      score: 1,
      createdAt: 1,
    },
  },
];

const sortByRank = { score: -1, commentCount: -1, viewCount: -1, createdAt: 1 };

export const getScoredPosts = async () => {
  try {
    const data = await Post.aggregate([
      ...eligiblePostStages,
      { $sort: sortByRank },
    ]);
    return {
      success: true,
      data,
      message: "Scored posts fetched successfully",
      status: 200,
    };
  } catch (error) {
    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};

export const getEligibleUsers = async () => {
  try {
    const data = await User.aggregate([
      { $match: { isContestEligible: true } },
      {
        $project: {
          _id: 0,
          userId: { $toString: "$_id" },
          name: 1,
          username: 1,
          residency: 1,
          isContestEligible: 1,
        },
      },
    ]);
    return {
      success: true,
      data,
      message: "Eligible users fetched successfully",
      status: 200,
    };
  } catch (error) {
    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};

export const getWeeklyTopThree = async () => {
  try {
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setHours(0, 0, 0, 0);
    currentWeekStart.setDate(
      currentWeekStart.getDate() - currentWeekStart.getDay(),
    );
    const oldestWeekStart = new Date(currentWeekStart);
    oldestWeekStart.setDate(oldestWeekStart.getDate() - 21);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 7);

    const data = await Post.aggregate([
      { $match: { createdAt: { $gte: oldestWeekStart, $lt: currentWeekEnd } } },
      ...eligiblePostStages,
      {
        $addFields: {
          weekNumber: {
            $add: [
              1,
              {
                $floor: {
                  $divide: [
                    { $subtract: [currentWeekEnd, "$createdAt"] },
                    604800000,
                  ],
                },
              },
            ],
          },
        },
      },
      { $sort: sortByRank },
      {
        $group: {
          _id: { userId: "$userId", weekNumber: "$weekNumber" },
          postCount: { $sum: 1 },
          rankedPosts: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          userId: "$_id.userId",
          weekNumber: "$_id.weekNumber",
          postCount: 1,
          topThreePosts: { $slice: ["$rankedPosts", 3] },
        },
      },
      { $addFields: { weekScore: { $sum: "$topThreePosts.score" } } },
      { $sort: { userId: 1, weekNumber: 1 } },
      {
        $group: {
          _id: "$userId",
          weeks: {
            $push: {
              weekNumber: "$weekNumber",
              postCount: "$postCount",
              topThreePosts: "$topThreePosts",
              weekScore: "$weekScore",
            },
          },
        },
      },
      { $project: { _id: 0, userId: "$_id", weeks: 1 } },
    ]);
    return {
      success: true,
      data,
      message: "Weekly top three posts fetched successfully",
      status: 200,
    };
  } catch (error) {
    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};
