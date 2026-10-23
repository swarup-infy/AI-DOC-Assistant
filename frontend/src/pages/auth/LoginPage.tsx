import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
} from "lucide-react";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      setServerError("");
      try {
        const response = await loginUser(data);
        await login(response.access_token);
        navigate("/dashboard", { replace: true });
      } catch (error) {
        setServerError(
          error instanceof Error ? error.message : "Unable to sign in."
        );
      }
    },
    [login, navigate]
  );

  return (
    <AuthLayout>
      <div className="auth-content grid w-full items-center gap-12 lg:grid-cols-[1fr_440px] lg:gap-16 xl:grid-cols-[1fr_460px]">
        <section
          className={`auth-intro hidden transition-all duration-700 ease-out lg:block ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <Logo size={48} />
          <p className="auth-eyebrow mt-14">
            <Sparkles size={14} aria-hidden="true" />
            A quieter way to work
          </p>
          <h1 className="auth-headline mt-5">
            Less searching.
            <span>More knowing.</span>
          </h1>
          <p className="auth-tagline mt-5">
            Your documents, all in one place.
          </p>
          <div className="auth-title-rule mt-8" aria-hidden="true">
            <span />
          </div>
        </section>

        <section className="flex justify-center lg:justify-end">
          <Card
            className={`auth-panel w-full max-w-md rounded-[28px] p-7 shadow-2xl transition-all duration-700 ease-out sm:p-9 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
          >
            <div className="mb-6 flex justify-center lg:hidden">
              <Logo size={40} />
            </div>

            <div className="mb-7">
              <p className="auth-card-kicker">YOUR WORKSPACE</p>
              <h2
                id="auth-title"
                className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-[2rem]"
              >
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in and pick up where you left off.
              </p>
            </div>

            {serverError && (
              <div
                role="alert"
                className="mb-5 flex items-center gap-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                icon={<Mail className="h-5 w-5" />}
                error={errors.email?.message}
                {...register("email")}
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
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
                {...register("password")}
              />

              <div className="flex items-center justify-between pt-1 text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="font-medium text-foreground/80 transition hover:text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                loading={isSubmitting}
                iconRight={<ArrowRight className="h-4 w-4" />}
                className="auth-primary-button h-12 w-full rounded-xl text-sm font-semibold"
              >
                Sign in
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              New here?
              <Link
                to="/register"
                className="ml-2 font-semibold text-foreground transition hover:text-primary"
              >
                Create an account
              </Link>
            </p>

            <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-muted-foreground">
              <p>Your documents stay organized in one place.</p>
              <nav aria-label="Legal links" className="mt-3 flex items-center justify-center gap-4">
                <Link to="/terms" className="underline underline-offset-4 transition hover:text-foreground">
                  Terms &amp; Conditions
                </Link>
                <a href="https://ai-doc-assistant-nu.vercel.app/privacy" className="underline underline-offset-4 transition hover:text-foreground">
                  Privacy Policy
                </a>
              </nav>
            </div>
          </Card>
        </section>
      </div>
    </AuthLayout>
  );
}
