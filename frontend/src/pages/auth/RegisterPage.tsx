import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Logo from "../../components/ui/Logo";
import {
  registerSchema,
  type RegisterFormData,
} from "../../types/auth";
import { registerUser } from "../../services/authService";

const features = [
  "Secure cloud storage",
  "AI powered document search",
  "Chat with your documents",
  "Enterprise-grade encryption",
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  const password = watch("password") ?? "";

  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const strengthColor = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-emerald-500",
  ][Math.max(passwordStrength - 1, 0)];

  const strengthLabel = [
    "Weak",
    "Fair",
    "Good",
    "Strong",
  ][Math.max(passwordStrength - 1, 0)];

  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      setServerError("");

      try {
        await registerUser({
          name: data.name,
          email: data.email,
          password: data.password,
        });

        navigate("/login", { replace: true });
      } catch (error) {
        setServerError(
          error instanceof Error
            ? error.message
            : "Unable to create account."
        );
      }
    },
    [navigate]
  );

  return (
    <AuthLayout>
      <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
        <section className="hidden lg:block">
          <Logo size={56} />

          <div className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
            <Sparkles size={14} />
            Start for free
          </div>

          <h1 className="mt-6 max-w-xl text-6xl font-black leading-tight">
            Create your
            <span className="block bg-gradient-to-r from-primary via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
              AI Workspace
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
            Upload, organize, search and chat with your documents using
            cutting-edge AI.
          </p>

          <div className="mt-12 space-y-5">
            {features.map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card/50 p-5 backdrop-blur"
              >
                <div className="rounded-xl bg-primary/10 p-3">
                  <Check size={18} className="text-primary" />
                </div>
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <ShieldCheck size={30} className="text-primary" />
            <div>
              <h3 className="font-semibold">Enterprise Security</h3>
              <p className="text-sm text-muted-foreground">
                AES-256 encryption with secure AI processing.
              </p>
            </div>
          </div>
        </section>

        <section className="flex justify-center">
          <Card className="w-full max-w-md rounded-3xl bg-card/80 p-10 shadow-2xl backdrop-blur-xl">
            <div className="mb-8 text-center">
              <Logo showWordmark={false} size={42} />
              <h2 className="mt-6 text-4xl font-bold">Create Account</h2>
              <p className="mt-3 text-muted-foreground">
                Start using AI Document Assistant today.
              </p>
            </div>

            {serverError && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
                <AlertCircle size={18} />
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Full Name"
                placeholder="John Doe"
                icon={<User size={18} />}
                error={errors.name?.message}
                autoComplete="name"
                {...register("name")}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                autoComplete="email"
                icon={<Mail size={18} />}
                error={errors.email?.message}
                {...register("email")}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  icon={<Lock size={18} />}
                  error={errors.password?.message}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-[45px] text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div>
                <div className="mb-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${strengthColor}`}
                    style={{ width: `${passwordStrength * 25}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Password strength:
                  <span className="ml-1 font-semibold">
                    {password.length ? strengthLabel : "Too Weak"}
                  </span>
                </p>
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  icon={<Lock size={18} />}
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="absolute right-4 top-[45px] text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded accent-primary"
                  required
                />
                <span>
                  I agree to the
                  <Link
                    to="/terms"
                    className="mx-1 font-medium text-primary hover:underline"
                  >
                    Terms
                  </Link>
                  and
                  <Link
                    to="/privacy"
                    className="ml-1 font-medium text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <Button
                type="submit"
                loading={isSubmitting}
                iconRight={<ArrowRight size={18} />}
                className="h-12 w-full rounded-xl text-base font-semibold"
              >
                Create Account
              </Button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                OR
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?
              <Link
                to="/login"
                className="ml-2 font-semibold text-primary hover:underline"
              >
                Sign In
              </Link>
            </p>

            <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <BrainCircuit size={20} className="text-primary" />
                <div>
                  <p className="text-sm font-semibold">AI Ready</p>
                  <p className="text-xs text-muted-foreground">
                    Create your workspace and start chatting with documents instantly.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </AuthLayout>
  );
}
