import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("kalashree_admin_token");
    const profileRaw = localStorage.getItem("kalashree_admin_profile");
    return { token: token || null, profile: profileRaw ? JSON.parse(profileRaw) : null };
  });

  const login = (token, profile) => {
    localStorage.setItem("kalashree_admin_token", token);
    localStorage.setItem("kalashree_admin_profile", JSON.stringify(profile));
    setAuth({ token, profile });
  };

  const logout = () => {
    localStorage.removeItem("kalashree_admin_token");
    localStorage.removeItem("kalashree_admin_profile");
    setAuth({ token: null, profile: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
