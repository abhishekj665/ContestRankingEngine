import { useState } from "react";
import { createPost } from "../../api/userService";

const CATEGORIES = [
  "Technology",
  "Education",
  "Sports",
  "Entertainment",
  "Travel",
  "Food",
  "Fashion",
  "Fitness",
  "Business",
  "Lifestyle",
];

export default function PostCreateForm({ onPostCreated }) {
  const [title, setTitle] = useState("");
  const [media, setMedia] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await createPost({ title, media, caption, category });

    setLoading(false);

    if (!result.success) {
      setError(result.message || "Could not create post");
      return;
    }

    setTitle("");
    setMedia("");
    setCaption("");
    onPostCreated(result.data);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-md p-6 max-w-md w-full"
    >
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Create a post
      </h2>

      <label className="block text-sm text-slate-600 mb-1">Title</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full border border-slate-300 rounded-md px-3 py-2 mb-3 text-sm"
      />

      <label className="block text-sm text-slate-600 mb-1">Media URL</label>
      <input
        type="url"
        value={media}
        onChange={(e) => setMedia(e.target.value)}
        placeholder="https://example.com/image.jpg"
        required
        className="w-full border border-slate-300 rounded-md px-3 py-2 mb-3 text-sm"
      />

      <label className="block text-sm text-slate-600 mb-1">Category</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full border border-slate-300 rounded-md px-3 py-2 mb-3 text-sm"
      >
        {CATEGORIES.map((currentCategory) => (
          <option key={currentCategory} value={currentCategory}>
            {currentCategory}
          </option>
        ))}
      </select>

      <label className="block text-sm text-slate-600 mb-1">Caption</label>
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        rows={3}
        className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4 text-sm"
      />

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
