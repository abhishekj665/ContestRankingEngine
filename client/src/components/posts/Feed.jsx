import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getPosts } from "../../api/userService";
import PostCard from "./PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPage = Number(searchParams.get("page"));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;
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

  function changePage(nextPage) {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      if (nextPage === 1) {
        nextParams.delete("page");
      } else {
        nextParams.set("page", String(nextPage));
      }
      return nextParams;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-indigo-600">User community</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Discover recent posts</h2>
        <p className="mt-2 text-sm text-slate-500">Every view, like, and comment contributes to a user’s contest score.</p>
      </div>

      {loading && <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading posts...</p>}
      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      {!loading && posts.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No posts yet. Be the first user to share something.</p>
      )}

      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}

      <div className="flex justify-center gap-3 mt-4 mb-8">
        <button
          onClick={() => changePage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm disabled:opacity-40"
        >
          Previous
        </button>
        <span className="py-2 text-sm font-medium text-slate-600">Page {page}</span>
        <button
          onClick={() => changePage(page + 1)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}
