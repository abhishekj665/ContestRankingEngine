import { useState } from "react";
import { likePost, commentOnPost } from "../../api/userService";

export default function PostCard({ post }) {
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [message, setMessage] = useState("");

  async function handleLike() {
    const result = await likePost(post._id);

    if (result.success) {
      setLikeCount(likeCount + 1);
      setLiked(true);
    } else {
      setMessage(result.message || "Could not like this post");
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;

    const result = await commentOnPost(post._id, commentText);

    if (result.success) {
      setCommentCount(commentCount + 1);
      setCommentText("");
    } else {
      setMessage(result.message || "Could not add comment");
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden mb-6">
      <img
        src={post.media}
        alt={post.caption}
        className="w-full max-h-96 object-cover"
      />

      <div className="p-4">
        <span className="text-xs text-indigo-600 font-medium">
          {post.category}
        </span>
        <p className="text-sm text-slate-800 mt-1 mb-3">{post.caption}</p>

        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
          <button
            onClick={handleLike}
            disabled={liked}
            className="hover:text-indigo-600 disabled:text-indigo-600"
          >
            {liked ? "Liked" : "Like"} ({likeCount})
          </button>
          <span>{commentCount} comments</span>
        </div>

        <form onSubmit={handleComment} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment"
            className="flex-1 border border-slate-300 rounded-md px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            className="bg-slate-100 text-slate-700 rounded-md px-3 py-1.5 text-sm hover:bg-slate-200"
          >
            Send
          </button>
        </form>

        {message && <p className="text-xs text-red-600 mt-2">{message}</p>}
      </div>
    </div>
  );
}
