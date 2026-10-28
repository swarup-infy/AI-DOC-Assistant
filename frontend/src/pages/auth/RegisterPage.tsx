import { useCallback, useMemo, useState } from "react";
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
  User,
} from "lucide-react";

import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Logo from "../../components/ui/Logo";
import { registerSchema, type RegisterFormData } from "../../types/auth";
import { registerUser } from "../../services/authService";

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

  const strengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500"][
    Math.max(passwordStrength - 1, 0)
  ];
  const strengthLabel = ["Weak", "Fair", "Good", "Strong"][
    Math.max(passwordStrength - 1, 0)
  ];

  const onSubmit = useCallback(async (data: RegisterFormData) => {
    setServerError("");
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password });
      navigate("/login", { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Unable to create account.");
    }
  }, [navigate]);

  return (
    <AuthLayout>
      <section className="w-full max-w-[640px]">
        <Card className="auth-enter-delay authGlassCard w-full rounded-[24px] border border-white/35 bg-card/20 px-6 py-7 shadow-2xl backdrop-blur-2xl sm:px-10 sm:py-9 md:px-12">
          <div className="mb-5 flex justify-center sm:justify-start">
            <Logo size={36} />
          </div>

          <header className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">AI Document Assistant</p>
            <h1 id="auth-title" className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Create your account</h1>
            <p className="mt-2 text-sm leading-6 text-white/75">Build your AI workspace and start exploring your documents.</p>
          </header>

          {serverError && (
            <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-rose-300/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              autoComplete="name"
              placeholder="Your name"
              icon={<User className="h-5 w-5" />}
              error={errors.name?.message}
              {...register("name")}
              className="!border-white/45 !bg-black/10 !text-white placeholder:!text-white/40 focus:!border-pink-400"
            />
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
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a password"
                icon={<Lock className="h-5 w-5" />}
                error={errors.password?.message}
                {...register("password")}
                className="!border-white/45 !bg-black/10 !text-white placeholder:!text-white/40 focus:!border-pink-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-4 top-[45px] z-10 rounded-md p-1 text-white/70 transition hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div>
              <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-black/20">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                  style={{ width: `${passwordStrength * 25}%` }}
                />
              </div>
              <p className="text-xs text-white/70">
                Password strength: <span className="font-semibold text-white">{password.length ? strengthLabel : "Not entered"}</span>
              </p>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm your password"
                icon={<Lock className="h-5 w-5" />}
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
                className="!border-white/45 !bg-black/10 !text-white placeholder:!text-white/40 focus:!border-pink-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                className="absolute right-4 top-[45px] z-10 rounded-md p-1 text-white/70 transition hover:text-white"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label className="flex items-start gap-3 text-sm text-white/75">
              <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 rounded accent-pink-500" aria-label="Agree to Terms of Service and Privacy Notice" required />
              <span>
                I agree to the <Link to="/terms" className="mx-1 font-semibold text-pink-300 hover:underline">Terms</Link>
                and <Link to="/privacy" className="ml-1 font-semibold text-pink-300 hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <Button type="submit" loading={isSubmitting} iconRight={<ArrowRight size={18} />} className="auth-submit h-12 w-full rounded-xl bg-[#ff174d] text-base font-bold text-white shadow-lg shadow-rose-950/30 hover:!bg-[#ff3564]">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/75">
            Already have an account?
            <Link to="/login" className="ml-2 font-bold text-pink-400 transition hover:text-pink-300 hover:underline">Sign in</Link>
          </p>
        </Card>
      </section>
    </AuthLayout>
  );
}
