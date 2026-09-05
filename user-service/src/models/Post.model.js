import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        media: {
            type: String,
            required: true,
        },

        caption: {
            type: String,
            trim: true,
        },
        
        category: {
            type: String,
            enum: [
                "Technology",
                "Education",
                "Sports",
                "Entertainment",
                "Travel",
                "Food",
                "Fashion",
                "Fitness",
                "Business",
                "Lifestyle"
            ],
            required: true,
        },
        viewCount : {
            type: Number,
            default: 0,
        },
        likeCount : {
            type: Number,
            default: 0,
        },
        commentCount : {
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
    }
);

postSchema.index({ category: 1, createdAt: -1 }); 

const Post = mongoose.model("Post", postSchema);

export default Post;