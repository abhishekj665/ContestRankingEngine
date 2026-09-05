import { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLoginSuccess(token, email) {
    loginUser(token, email);
    navigate("/feed");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <LoginForm onLoginSuccess={handleLoginSuccess} />
      <p className="text-sm text-slate-500 mt-4">
        No account?{" "}
        <Link to="/signup" className="text-indigo-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
