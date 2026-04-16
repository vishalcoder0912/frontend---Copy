import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Stethoscope, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { HOME_BY_ROLE } from "../utils/roles";

export default function Login() {
  const { isAuthenticated, user, login } = useAuth();

  useEffect(() => {
    const autoLogin = async () => {
      await login({ email: "admin@medicare.com", password: "admin123" });
    };
    if (!isAuthenticated) {
      autoLogin();
    }
  }, []);

  if (isAuthenticated) {
    return <Navigate to={HOME_BY_ROLE[user?.role] || "/"} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-sky-600 to-blue-700 p-10 text-white lg:flex">
        <div className="flex items-center gap-3 text-2xl font-semibold">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sky-600">
            <Stethoscope className="h-6 w-6" />
          </div>
          Medicare HMS
        </div>
        <div>
          <h2 className="text-3xl font-semibold">Hospital Management System</h2>
          <p className="mt-2 text-sm text-white/80">
            Manage patients, doctors, appointments, and billing in one place.
          </p>
        </div>
        <p className="text-xs text-white/70">Logging in automatically...</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-slate-500">Logging you in as Admin...</p>
        </div>
      </div>
    </div>
  );
}
