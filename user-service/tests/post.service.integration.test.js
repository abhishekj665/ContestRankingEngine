import assert from "node:assert/strict";
import test from "node:test";
import { connectDb, disconnectDb } from "../src/config/db.js";
import User from "../src/models/User.model.js";
import Post from "../src/models/Post.model.js";
import Like from "../src/models/Like.model.js";
import { likePost } from "../src/services/post.service.js";

const shouldRunIntegrationTests = process.env.RUN_INTEGRATION_TESTS === "true";

test(
  "two simultaneous likes allow only one like from the same user",
  { skip: !shouldRunIntegrationTests },
  async () => {
    const uniqueValue = Date.now();
    let user;
    let post;

    await connectDb();

    try {
      await Like.init();

      user = await User.create({
        name: "Like Integration User",
        email: `like-test-${uniqueValue}@example.com`,
        username: `like-test-${uniqueValue}`,
        password: "TestPassword123",
        residency: "Chhattisgarh",
      });
      post = await Post.create({
        title: "Integration test post",
        media: "https://example.com/test.jpg",
        category: "Technology",
        author: user._id,
      });

      const results = await Promise.all([
        likePost(post._id.toString(), user._id.toString()),
        likePost(post._id.toString(), user._id.toString()),
      ]);
      const successfulLikes = results.filter((result) => result.success);
      const savedLikes = await Like.countDocuments({
        userId: user._id,
        postId: post._id,
      });

      assert.equal(successfulLikes.length, 1);
      assert.equal(results.find((result) => !result.success).status, 409);
      assert.equal(savedLikes, 1);
    } finally {
      if (post) {
        await Like.deleteMany({ postId: post._id });
        await Post.deleteOne({ _id: post._id });
      }

      if (user) {
        await User.deleteOne({ _id: user._id });
      }

      await disconnectDb();
    }
  },
);
