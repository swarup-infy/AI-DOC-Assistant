import { useCallback, useEffect, useMemo, useState } from "react";
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
import Input from "../../components/ui/Input";
import Logo from "../../components/ui/Logo";
import {
  registerSchema,
  type RegisterFormData,
} from "../../types/auth";
import { registerUser } from "../../services/authService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

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

  const strengthLabel = ["Weak", "Fair", "Good", "Strong"][
    Math.max(passwordStrength - 1, 0)
  ];

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
          error instanceof Error ? error.message : "Unable to create account."
        );
      }
    },
    [navigate]
  );

  return (
    <AuthLayout>
      <div className={`auth-content auth-split-layout auth-register-layout w-full ${mounted ? "auth-revealed" : "auth-pending"}`}>
        <section className="auth-form-side auth-register-form">
          <div className="auth-form-brand">
            <Logo size={38} />
          </div>

          <div className="auth-form-heading">
            <p className="auth-card-kicker">START YOUR WORKSPACE</p>
            <h1 id="auth-title">Create your account</h1>
            <p>A calmer, smarter home for all your documents.</p>
          </div>

          {serverError && (
            <div role="alert" className="mb-4 flex items-center gap-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle size={18} className="shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form-fields auth-register-fields">
            <Input
              label="Full name"
              placeholder="Your name"
              autoComplete="name"
              icon={<User size={18} />}
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              icon={<Mail size={18} />}
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              autoComplete="new-password"
              icon={<Lock size={18} />}
              error={errors.password?.message}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              {...register("password")}
            />

            <div className="auth-password-strength">
              <div className="auth-strength-track" aria-hidden="true">
                <div
                  className={`auth-strength-fill ${strengthColor}`}
                  style={{ width: `${passwordStrength * 25}%` }}
                />
              </div>
              <span>Password strength: <strong>{password.length ? strengthLabel : "Not set"}</strong></span>
            </div>

            <Input
              label="Confirm password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              icon={<Lock size={18} />}
              error={errors.confirmPassword?.message}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              {...register("confirmPassword")}
            />

            <label className="auth-terms-check">
              <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 rounded accent-primary" required />
              <span>
                I agree to the <Link to="/terms">Terms</Link> and{" "}
                <Link to="/privacy">Privacy Policy</Link>.
              </span>
            </label>

            <Button
              type="submit"
              loading={isSubmitting}
              iconRight={<ArrowRight size={18} />}
              className="auth-primary-button h-12 w-full rounded-xl text-sm font-semibold"
            >
              Create account
            </Button>
          </form>

          <p className="auth-switch-copy">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          <div className="auth-legal-footer">
            <p>Your workspace, ready to grow with you.</p>
          </div>
        </section>
      </div>
    </AuthLayout>
  );
}
