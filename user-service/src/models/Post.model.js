import mongoose from "mongoose";
import { CONTEST_CATEGORIES } from "../config/contest.config.js";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
        media: {
            type: String,
            required: true,
        },
        mediaType: {
            type: String,
            default: "image/jpeg",
        },

    caption: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      enum: CONTEST_CATEGORIES,
      required: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
