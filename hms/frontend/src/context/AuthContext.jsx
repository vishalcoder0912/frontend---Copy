import PropTypes from "prop-types";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import api from "../lib/api";
import useLocalStorage from "../hooks/useLocalStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [storedUser, setStoredUser] = useLocalStorage("medicare_user", null);
  const [user, setUser] = useState(storedUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("medicare_token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get("/auth/me");
        setUser(response.data?.user);
        setStoredUser(response.data?.user);
      } catch {
        localStorage.removeItem("medicare_token");
        setUser(null);
        setStoredUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    verify();
  }, [setStoredUser]);

  const login = async (payload) => {
    try {
      const response = await api.post("/auth/login", payload);
      localStorage.setItem("medicare_token", response.data?.token);
      setStoredUser(response.data?.user);
      setUser(response.data?.user);
      toast.success("Login successful");
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, message: error.message };
    }
  };

  const register = async (payload) => {
    try {
      const response = await api.post("/auth/register", payload);
      localStorage.setItem("medicare_token", response.data?.token);
      setStoredUser(response.data?.user);
      setUser(response.data?.user);
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
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
