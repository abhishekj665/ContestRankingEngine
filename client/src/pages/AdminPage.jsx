import { useState } from "react";
import { adminLogin } from "../api/adminService";
import WinnerTable from "../components/admin/WinnerTable";

export default function AdminPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    !!localStorage.getItem("adminToken"),
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleAdminLogin(e) {
    e.preventDefault();
    setError("");

    const result = await adminLogin(email, password);

    if (!result.success) {
      setError(result.message || "Login failed");
      return;
    }

    localStorage.setItem("adminToken", result.data.token);
    setIsAdminLoggedIn(true);
  }

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <form
          onSubmit={handleAdminLogin}
          className="bg-white border border-slate-200 rounded-md p-6 max-w-sm w-full"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Admin login
          </h2>

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
            className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4 text-sm"
          />

          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700"
          >
            Log in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <WinnerTable />
    </div>
  );
}
