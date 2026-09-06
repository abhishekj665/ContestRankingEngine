import { useNavigate } from "react-router-dom";
import PostCreateForm from "../components/posts/PostCreateForm";

export default function CreatePostPage() {
  const navigate = useNavigate();

  function handlePostCreated() {
    navigate("/feed");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-7 max-w-md text-center">
        <p className="text-sm font-medium text-indigo-600">Share your work</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Create a post</h1>
        <p className="mt-2 text-sm text-slate-500">Upload an image or video and choose the category that fits best.</p>
      </div>
      <PostCreateForm onPostCreated={handlePostCreated} />
    </div>
  );
}
