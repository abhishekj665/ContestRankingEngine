import { useState } from "react";
import { toast } from "react-toastify";
import { login } from "../../api/userService";

export default function LoginForm({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const result = await login(identifier.trim(), password);

    setLoading(false);

    if (!result.success) {
      toast.error(result.message || "Login failed");
      return;
    }

    toast.success(result.message || "Login successful");
    onLoginSuccess(result.data.token, identifier.trim());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-md p-6 max-w-sm w-full"
    >
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Log in</h2>

      <label className="block text-sm text-slate-600 mb-1">Email or username</label>
      <input
        type="text"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="you@example.com or username"
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
        className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
