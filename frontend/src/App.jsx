import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import AppRouter from "./routes/AppRouter";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
});

/**
 * Root app with global providers.
 */
export default function App() {
  useEffect(() => {
    const handleError = (event) => {
      toast.error(event?.message || "Unexpected error");
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
