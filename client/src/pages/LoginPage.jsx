import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [role, setRole] = useState("user");

  function handleLoginSuccess(token, loggedInRole, email) {
    login(token, loggedInRole, email);
    navigate(loggedInRole === "admin" ? "/admin" : "/feed");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-7 max-w-sm text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-200">C</div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to create, discover, or manage contest winners.</p>
      </div>
      <div className="max-w-sm w-full mb-4 rounded-md border border-slate-200 bg-white p-1 flex">
        <button type="button" onClick={() => setRole("user")} className={`flex-1 rounded px-3 py-2 text-sm ${role === "user" ? "bg-indigo-600 text-white" : "text-slate-600"}`}>User</button>
        <button type="button" onClick={() => setRole("admin")} className={`flex-1 rounded px-3 py-2 text-sm ${role === "admin" ? "bg-indigo-600 text-white" : "text-slate-600"}`}>Admin</button>
      </div>
      <LoginForm role={role} onLoginSuccess={handleLoginSuccess} />
      {role === "user" && <p className="text-sm text-slate-500 mt-4">
        No account?{" "}
        <Link to="/signup" className="text-indigo-600 hover:underline">
          Sign up
        </Link>
      </p>}
    </div>
  );
}
