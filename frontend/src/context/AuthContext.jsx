import PropTypes from "prop-types";
import { createContext, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import api from "../lib/api";
import useLocalStorage from "../hooks/useLocalStorage";

const AuthContext = createContext(null);

/**
 * Auth provider with JWT storage.
 */
export function AuthProvider({ children }) {
  const [storedUser, setStoredUser] = useLocalStorage("medicare_user", null);
  const [user, setUser] = useState(storedUser);

  const login = async (payload) => {
    try {
      const { data } = await api.post("/auth/login", payload);
      localStorage.setItem("medicare_token", data?.data?.token);
      setStoredUser(data?.data?.user);
      setUser(data?.data?.user);
      toast.success("Login successful");
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, message: error.message };
    }
  };

  const register = async (payload) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("medicare_token", data?.data?.token);
      setStoredUser(data?.data?.user);
      setUser(data?.data?.user);
      toast.success("Account created");
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("medicare_token");
    setStoredUser(null);
    setUser(null);
    toast.success("Logged out");
  };

  const value = useMemo(
    () => ({ user, login, register, logout, isAuthenticated: Boolean(user) }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Access auth state.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
