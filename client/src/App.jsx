import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/authContext.jsx";
import { ToastContainer } from "react-toastify";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import CreatePostPage from "./pages/CreatePostPage";
import AdminPage from "./pages/AdminPage";

function NavBar() {
  const { isLoggedIn, email, logoutUser } = useContext(AuthContext);

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <div className="flex gap-4 text-sm text-slate-600">
        <Link to="/feed" className="hover:text-indigo-600">
          Feed
        </Link>
        <Link to="/create" className="hover:text-indigo-600">
          Create post
        </Link>
        <Link to="/profile" className="hover:text-indigo-600">
          Profile
        </Link>
        <Link to="/admin" className="hover:text-indigo-600">
          Admin
        </Link>
      </div>
      <div className="text-sm text-slate-600">
        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <span>{email}</span>
            <button
              onClick={logoutUser}
              className="text-indigo-600 hover:underline"
            >
              Log out
            </button>
          </div>
        ) : (
          <Link to="/login" className="text-indigo-600 hover:underline">
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/feed" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreatePostPage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
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
