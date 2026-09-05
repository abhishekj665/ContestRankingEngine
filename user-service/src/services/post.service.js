import ExpressError from "../utils/ExpressError.util.js";
import Post from "../models/Post.model.js";
import Like from "../models/Like.model.js";
import Comment from "../models/Comment.model.js";

export const createPost = async (data, userId) => {
  try {
    const { media, caption, category } = data;
    if (!media || !category) {
      throw new ExpressError(400, "Media,and category are required");
    }
    const post = await Post.create({
      userId,
      media,
      caption,
      category,
      author: userId,
    });
    return {
      success: true,
      data: post,
      message: "Post created successfully",
      status: 201,
    };
  } catch (error) {
    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};

export const getAllPosts = async ({ category, page, limit }) => {
  try {
    const filter = category ? { category } : {};
    const posts = await Post.find(filter)
      .populate("author", "name username")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit));
    if (!posts) {
      return {
        success: false,
        data: null,
        message: "No posts found",
        status: 404,
      };
    }

    const postIds = posts.map((post) => post._id);
    await Post.updateMany(
      { _id: { $in: postIds } },
      { $inc: { viewCount: 1 } },
    );

    return {
      success: true,
      data: posts,
      message: "Posts retrieved successfully",
      status: 200,
    };
  } catch (error) {
    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};

export const likePost = async (postId, userId) => {
  try {
    const post = await Post.findById(postId);

    if (!post) {
      return {
        success: false,
        data: null,
        message: "Post not found",
        status: 404,
      };
    }

    const existingLike = await Like.findOne({ userId: userId, postId });

    if (existingLike) {
      return {
        success: false,
        data: null,
        message: "Post already liked by this user",
        status: 400,
      };
    }
    const like = await Like.create({ userId: userId, postId });

    post.likeCount += 1;
    await post.save();

    return {
      success: true,
      data: like,
      message: "Post liked successfully",
      status: 201,
    };
  } catch (error) {
    if (error.code === 11000) {
      return {
        success: false,
        data: null,
        message: "Post already liked by this user",
        status: 400,
      };
    }

    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};

export const commentOnPost = async (postId, userId, content) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return {
        success: false,
        data: null,
        message: "Post not found",
        status: 404,
      };
    }
    const comment = await Comment.create({ postId, userId, content });
    post.commentCount += 1;
    await post.save();
    return {
      success: true,
      data: comment,
      message: "Comment added successfully",
      status: 201,
    };
  } catch (error) {
    throw new ExpressError(500, error.message || "Internal Server Error");
  }
};
