import { useNavigate, Link } from "react-router-dom";
import SignupForm from "../components/auth/SignupForm";

export default function SignupPage() {
  const navigate = useNavigate();

  function handleSignupSuccess() {
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-7 max-w-sm text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-200">C</div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Join the contest</h1>
        <p className="mt-2 text-sm text-slate-500">Share your work, build engagement, and compete fairly.</p>
      </div>
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
