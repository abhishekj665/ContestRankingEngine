import { createContext, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState(localStorage.getItem("email"));

  function loginUser(newToken, userEmail) {
    localStorage.clear();
    localStorage.setItem("token", newToken);
    localStorage.setItem("email", userEmail);
    setToken(newToken);
    setEmail(userEmail);
  }

  function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setToken(null);
    setEmail(null);
  }

  const value = {
    token,
    email,
    isLoggedIn: !!token,
    loginUser,
    logoutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
