import { useEffect, useState } from "react";
import { createPost } from "../../api/userService";

const CATEGORIES = ["Technology", "Education", "Sports", "Entertainment", "Travel", "Food", "Fashion", "Fitness", "Business", "Lifestyle"];

export default function PostCreateForm({ onPostCreated }) {
  const [title, setTitle] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  function chooseMedia(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setMedia(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!media) return setError("Choose an image or video first.");
    setError("");
    setLoading(true);
    const result = await createPost({ title, media, caption, category });
    setLoading(false);
    if (!result.success) return setError(result.message || "Could not create post");
    setTitle("");
    setCaption("");
    setMedia(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    event.target.reset();
    onPostCreated(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-md p-6 max-w-md w-full">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Create a post</h2>
      <label className="block text-sm text-slate-600 mb-1">Title</label>
      <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} required className="w-full border border-slate-300 rounded-md px-3 py-2 mb-3 text-sm" />

      <label className="block text-sm text-slate-600 mb-1">Photo or video</label>
      <input type="file" accept="image/*,video/*" onChange={chooseMedia} required className="w-full border border-slate-300 rounded-md px-3 py-2 mb-3 text-sm file:mr-3 file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-indigo-700" />
      <p className="text-xs text-slate-500 -mt-2 mb-3">Images and videos up to 10 MB.</p>
      {previewUrl && (media?.type.startsWith("video/") ? <video src={previewUrl} controls className="w-full max-h-64 object-contain bg-slate-100 rounded-md mb-3" /> : <img src={previewUrl} alt="Selected media preview" className="w-full max-h-64 object-contain bg-slate-100 rounded-md mb-3" />)}

      <label className="block text-sm text-slate-600 mb-1">Category</label>
      <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 mb-3 text-sm">
        {CATEGORIES.map((currentCategory) => <option key={currentCategory} value={currentCategory}>{currentCategory}</option>)}
      </select>

      <label className="block text-sm text-slate-600 mb-1">Caption</label>
      <textarea value={caption} onChange={(event) => setCaption(event.target.value)} rows={3} className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4 text-sm" />
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">{loading ? "Posting..." : "Post"}</button>
    </form>
  );
}
