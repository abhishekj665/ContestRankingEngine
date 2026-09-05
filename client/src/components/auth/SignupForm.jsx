import { useState } from "react";
import { toast } from "react-toastify";
import { signup } from "../../api/userService";

export default function SignupForm({ onSignupSuccess }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [residency, setResidency] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const result = await signup(name, username, email, password, residency);

    setLoading(false);

    if (!result.success) {
      toast.error(result.message || "Signup failed");
      return;
    }

    toast.success(result.message || "Account created successfully");
    onSignupSuccess();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-md p-6 max-w-sm w-full"
    >
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Sign up</h2>

      <label className="block text-sm text-slate-600 mb-1">Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full border border-slate-300 rounded-md px-3 py-2 mb-3 text-sm"
      />

      <label className="block text-sm text-slate-600 mb-1">Username</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="w-full border border-slate-300 rounded-md px-3 py-2 mb-3 text-sm"
      />

      <label className="block text-sm text-slate-600 mb-1">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full border border-slate-300 rounded-md px-3 py-2 mb-3 text-sm"
      />

      <label className="block text-sm text-slate-600 mb-1">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full border border-slate-300 rounded-md px-3 py-2 mb-3 text-sm"
      />

      <label className="block text-sm text-slate-600 mb-1">
        Residency
      </label>
      <input
        type="text"
        value={residency}
        onChange={(e) => setResidency(e.target.value)}
        placeholder="e.g. Chhattisgarh"
        required
        className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4 text-sm"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
