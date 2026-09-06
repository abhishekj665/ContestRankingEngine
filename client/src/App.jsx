import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext.jsx";
import { ToastContainer } from "react-toastify";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import CreatePostPage from "./pages/CreatePostPage";
import AdminPage from "./pages/AdminPage";

function NavBar() {
  const { isLoggedIn, email, role, logout } = useContext(AuthContext);

  if (!isLoggedIn) {
    return null;
  }

  const linkClass = ({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
  }`;

  return (
    <nav className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <NavLink to={role === "admin" ? "/admin" : "/feed"} className="flex items-center gap-2 font-bold text-slate-900">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm text-white">C</span>
            <span className="hidden sm:inline">User Contest</span>
          </NavLink>
          <div className="flex items-center gap-1">
            {role === "user" && <NavLink to="/feed" className={linkClass}>Feed</NavLink>}
            {role === "user" && <NavLink to="/create" className={linkClass}>Create</NavLink>}
            {role === "user" && <NavLink to="/profile" className={linkClass}>Profile</NavLink>}
            {role === "admin" && <NavLink to="/admin" className={linkClass}>Dashboard</NavLink>}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden max-w-40 truncate text-slate-500 sm:inline">{email || role}</span>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}

function ProtectedRoute({ children, role }) {
  const { isLoggedIn, role: currentRole } = useContext(AuthContext);
  return isLoggedIn && (!role || currentRole === role)
    ? children
    : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <NavBar />
      <main>
        <Routes>
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/feed"
          element={
              <ProtectedRoute role="user">
              <FeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
              <ProtectedRoute role="user">
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
              <ProtectedRoute role="user">
              <CreatePostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
              <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}
