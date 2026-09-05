import { useState, useEffect } from "react";
import { getPosts } from "../../api/userService";
import PostCard from "./PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function loadPosts() {
    setLoading(true);
    setError("");

    const result = await getPosts(page, 10);

    setLoading(false);

    if (!result.success) {
      setError(result.message || "Could not load posts");
      return;
    }

    setPosts(result.data);
  }

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Feed</h2>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && posts.length === 0 && (
        <p className="text-sm text-slate-500">No posts yet.</p>
      )}

      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}

      <div className="flex justify-center gap-3 mt-4 mb-8">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="border border-slate-300 rounded-md px-4 py-1.5 text-sm disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-sm text-slate-600 py-1.5">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="border border-slate-300 rounded-md px-4 py-1.5 text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}
