import { useState } from "react";
import { toast } from "react-toastify";
import { login } from "../../api/userService";
import { adminLogin } from "../../api/adminService";

export default function LoginForm({ role, onLoginSuccess }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const result = role === "admin"
      ? await adminLogin(identifier.trim(), password)
      : await login(identifier.trim(), password);

    setLoading(false);

    if (!result.success) {
      toast.error(result.message || "Login failed");
      return;
    }

    toast.success(result.message || "Login successful");
    onLoginSuccess(result.data.token, role, identifier.trim());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60"
    >
      <h2 className="mb-5 text-xl font-semibold text-slate-900">
        Log in as {role === "admin" ? "admin" : "user"}
      </h2>

      <label className="block text-sm text-slate-600 mb-1">
        {role === "admin" ? "Email" : "Email or username"}
      </label>
      <input
        type="text"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder={role === "admin" ? "admin@example.com" : "you@example.com or username"}
        required
        className="w-full border border-slate-300 rounded-md px-3 py-2 mb-3 text-sm"
      />

      <label className="block text-sm text-slate-600 mb-1">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4 text-sm"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
