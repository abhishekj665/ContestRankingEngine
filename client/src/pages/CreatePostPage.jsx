import { useNavigate } from "react-router-dom";
import PostCreateForm from "../components/posts/PostCreateForm";

export default function CreatePostPage() {
  const navigate = useNavigate();

  function handlePostCreated() {
    navigate("/feed");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-8">
      <PostCreateForm onPostCreated={handlePostCreated} />
    </div>
  );
}
