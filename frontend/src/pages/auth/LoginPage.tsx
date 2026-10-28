import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";

import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Logo from "../../components/ui/Logo";
import { loginSchema, type LoginFormData } from "../../types/auth";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const togglePassword = useCallback(() => {
    setShowPassword((previous) => !previous);
  }, []);

  const onSubmit = useCallback(async (data: LoginFormData) => {
    setServerError("");
    try {
      const response = await loginUser(data);
      await login(response.access_token);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Unable to sign in.");
    }
  }, [login, navigate]);

  return (
    <AuthLayout>
      <section className="w-full max-w-[640px]">
        <Card className="auth-enter-delay authGlassCard w-full rounded-[24px] border border-white/35 bg-card/20 px-6 py-8 shadow-2xl backdrop-blur-2xl sm:px-10 sm:py-10 md:px-12">
          <div className="mb-7 flex justify-center sm:justify-start">
            <Logo size={38} />
          </div>

          <header className="mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">AI Document Assistant</p>
            <h1 id="auth-title" className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Welcome back</h1>
            <p className="mt-3 text-sm leading-6 text-white/75 sm:text-base">Sign in to continue to your workspace.</p>
          </header>

          {serverError && (
            <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-rose-300/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              icon={<Mail className="h-5 w-5" />}
              error={errors.email?.message}
              {...register("email")}
              className="!border-white/45 !bg-black/10 !text-white placeholder:!text-white/40 focus:!border-pink-400"
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              icon={<Lock className="h-5 w-5" />}
              error={errors.password?.message}
              endAdornment={
                <button
                  type="button"
                  onClick={togglePassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
              {...register("password")}
              className="!border-white/45 !bg-black/10 !text-white placeholder:!text-white/40 focus:!border-pink-400"
            />

            <div className="flex items-center justify-between gap-3 pt-1 text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2.5 text-white/80">
                <input type="checkbox" className="h-4 w-4 rounded border-white/40 accent-pink-500" />
                Remember me
              </label>
              <Link to="/forgot-password" className="font-medium text-white/80 transition hover:text-pink-300 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              loading={isSubmitting}
              iconRight={<ArrowRight className="h-5 w-5" />}
              className="auth-submit mt-2 h-12 w-full rounded-xl bg-[#ff174d] text-base font-bold text-white shadow-lg shadow-rose-950/30 hover:!bg-[#ff3564]"
            >
              Sign In
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-white/75">
            Don&apos;t have an account?
            <Link to="/register" className="ml-2 font-bold text-pink-400 transition hover:text-pink-300 hover:underline">Sign up</Link>
          </p>
        </Card>
      </section>
    </AuthLayout>
  );
}
