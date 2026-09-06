import { createContext, useState } from "react";

export const AuthContext = createContext(null);

const SESSION_KEY = "contestSession";

function readSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (session?.token && ["user", "admin"].includes(session.role)) return session;
  } catch {
  }
  return null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  function login(newToken, role, email = "") {
    const nextSession = { token: newToken, role, email };
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("email");
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("email");
    setSession(null);
  }

  const value = {
    token: session?.token ?? null,
    email: session?.email ?? "",
    role: session?.role ?? null,
    isLoggedIn: Boolean(session?.token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
