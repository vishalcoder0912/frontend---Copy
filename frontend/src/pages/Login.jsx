import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/**
 * Login page.
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values) => {
    const result = await login(values);
    if (result.success) {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <span className="text-xs text-rose-600">{form.formState.errors.email.message}</span>
              )}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" {...form.register("password")} />
              {form.formState.errors.password && (
                <span className="text-xs text-rose-600">{form.formState.errors.password.message}</span>
              )}
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-slate-500">
            Don’t have an account? <Link to="/register" className="text-sky-600">Register</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
