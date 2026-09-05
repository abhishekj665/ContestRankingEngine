import { useNavigate, Link } from "react-router-dom";
import SignupForm from "../components/auth/SignupForm";

export default function SignupPage() {
  const navigate = useNavigate();

  function handleSignupSuccess() {
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <SignupForm onSignupSuccess={handleSignupSuccess} />
      <p className="text-sm text-slate-500 mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
