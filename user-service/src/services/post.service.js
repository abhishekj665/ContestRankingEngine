import ExpressError from "../utils/ExpressError.util.js";
import Post from "../models/Post.model.js";
import Like from "../models/Like.model.js";
import Comment from "../models/Comment.model.js";

const fail = (error) => {
  if (error.statusCode) throw error;
  throw new ExpressError(500, error.message || "Internal Server Error");
};

export const createPost = async (data, userId) => {
  try {
    const { title, media, mediaType, caption, category } = data;
    if (!title || !media || !category)
      throw new ExpressError(400, "Title, media, and category are required");
    const post = await Post.create({
      title,
      media,
      mediaType,
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
    fail(error);
  }
};

export const getAllPosts = async ({ category, page, limit }) => {
  try {
    const posts = await Post.find(category ? { category } : {})
      .populate("author", "name username")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit);
    const ids = posts.map((post) => post._id);
    if (ids.length) {
      await Post.updateMany({ _id: { $in: ids } }, { $inc: { viewCount: 1 } });
      // Keep the response consistent with the stored count that was just
      // incremented, rather than making the feed display a stale value.
      posts.forEach((post) => {
        post.viewCount += 1;
      });
    }
    return {
      success: true,
      data: posts,
      message: "Posts retrieved successfully",
      status: 200,
    };
  } catch (error) {
    fail(error);
  }
};

export const likePost = async (postId, userId) => {
  try {
    if (!(await Post.exists({ _id: postId })))
      return {
        success: false,
        data: null,
        message: "Post not found",
        status: 404,
      };
    const like = await Like.create({ userId, postId });
    await Post.updateOne({ _id: postId }, { $inc: { likeCount: 1 } });
    return {
      success: true,
      data: like,
      message: "Post liked successfully",
      status: 201,
    };
  } catch (error) {
    if (error.code === 11000)
      return {
        success: false,
        data: null,
        message: "Post already liked by this user",
        status: 409,
      };
    fail(error);
  }
};

export const commentOnPost = async (postId, userId, content) => {
  try {
    if (!(await Post.exists({ _id: postId })))
      return {
        success: false,
        data: null,
        message: "Post not found",
        status: 404,
      };
    const comment = await Comment.create({ postId, userId, content });
    await Post.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });
    return {
      success: true,
      data: comment,
      message: "Comment added successfully",
      status: 201,
    };
  } catch (error) {
    fail(error);
  }
};
