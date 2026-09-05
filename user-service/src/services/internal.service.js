import Post from "../models/Post.model.js";
import User from "../models/User.model.js";
import ExpressError from "../utils/ExpressError.util.js";
import { getWeekNumber } from "../utils/week.util.js";

const calculateScore = (post) => {
  const likeScore = post.likeCount * 1;
  const commentScore = post.commentCount * 3;
  const viewScore = post.viewCount * 0.2;
  const totalScore = likeScore + commentScore + viewScore;

  return totalScore;
};

const sortPostsByScore = (firstPost, secondPost) => {
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

const createPostRankingData = (post) => {
  const postData = {
    postId: post._id.toString(),
    userId: post.author._id.toString(),
    category: post.category,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    viewCount: post.viewCount,
    score: calculateScore(post),
    createdAt: post.createdAt,
  };

  return postData;
};

export const getScoredPosts = async () => {
  try {
    const posts = await Post.find()
      .populate("author", "isContestEligible")
      .sort({ createdAt: 1 });

    const scoredPosts = [];

    for (const post of posts) {
      if (!post.author || !post.author.isContestEligible) {
        continue;
      }

      const postData = createPostRankingData(post);
      scoredPosts.push(postData);
    }

    scoredPosts.sort(sortPostsByScore);

    return {
      success: true,
      data: scoredPosts,
      message: "Scored posts fetched successfully",
      status: 200,
    };
  } catch (error) {
    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};

export const getEligibleUsers = async () => {
  try {
    const users = await User.find({ isContestEligible: true }).select(
      "name username residency isContestEligible",
    );

    const eligibleUsers = [];

    for (const user of users) {
      const userData = {
        userId: user._id.toString(),
        name: user.name,
        username: user.username,
        residency: user.residency,
        isContestEligible: user.isContestEligible,
      };

      eligibleUsers.push(userData);
    }

    return {
      success: true,
      data: eligibleUsers,
      message: "Eligible users fetched successfully",
      status: 200,
    };
  } catch (error) {
    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};

export const getWeeklyTopThree = async () => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentWeekNumber = getWeekNumber(currentDate);
    const posts = await Post.find().populate("author", "isContestEligible");
    const usersWeeklyPosts = {};

    for (const post of posts) {
      if (!post.author || !post.author.isContestEligible) {
        continue;
      }

      const postDate = new Date(post.createdAt);
      const postYear = postDate.getFullYear();
      const postWeekNumber = getWeekNumber(postDate);
      let weekDifference;

      if (postYear === currentYear) {
        weekDifference = currentWeekNumber - postWeekNumber;
      } else if (postYear === currentYear - 1) {
        const lastDayOfPreviousYear = new Date(currentYear - 1, 11, 31);
        const totalWeeksInPreviousYear = getWeekNumber(lastDayOfPreviousYear);

        weekDifference =
          currentWeekNumber + totalWeeksInPreviousYear - postWeekNumber;
      } else {
        continue;
      }

      if (weekDifference < 0 || weekDifference > 3) {
        continue;
      }

      const weekNumber = weekDifference + 1;
      const userId = post.author._id.toString();

      if (!usersWeeklyPosts[userId]) {
        usersWeeklyPosts[userId] = {
          userId,
          week1: [],
          week2: [],
          week3: [],
          week4: [],
        };
      }

      const postData = createPostRankingData(post);
      usersWeeklyPosts[userId][`week${weekNumber}`].push(postData);
    }

    const weeklyTopThree = [];

    for (const userId in usersWeeklyPosts) {
      const userWeeklyData = usersWeeklyPosts[userId];
      const weeklyData = {
        userId: userWeeklyData.userId,
        weeks: [],
      };

      for (let weekNumber = 1; weekNumber <= 4; weekNumber += 1) {
        const weekPosts = userWeeklyData[`week${weekNumber}`];
        weekPosts.sort(sortPostsByScore);

        const topThreePosts = weekPosts.slice(0, 3);
        let weekScore = 0;

        for (const post of topThreePosts) {
          weekScore += post.score;
        }

        weeklyData.weeks.push({
          weekNumber,
          postCount: weekPosts.length,
          topThreePosts,
          weekScore,
        });
      }

      weeklyTopThree.push(weeklyData);
    }

    return {
      success: true,
      data: weeklyTopThree,
      message: "Weekly top three posts fetched successfully",
      status: 200,
    };
  } catch (error) {
    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};
