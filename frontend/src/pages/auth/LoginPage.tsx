import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Mail,
  Search,
  Sparkles,
} from "lucide-react";

import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Logo from "../../components/ui/Logo";
import { loginSchema, type LoginFormData } from "../../types/auth";
import { loginUser } from "../../services/authService";
import api from "../../api/api";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Wake a sleeping free-tier backend while the user enters credentials.
    void api.get("/auth/", { timeout: 90000 }).catch(() => undefined);
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
        const user = response.user
          ? {
              id: response.user.id,
              name: response.user.username,
              email: response.user.email,
              created_at: response.user.created_at,
            }
          : undefined;

        await login(response.access_token, user);
        navigate("/dashboard", { replace: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        setServerError(
          message.toLowerCase().includes("timeout")
            ? "The server is taking longer than expected to wake up. Please wait a moment and try again."
            : message || "Unable to sign in."
        );
      }
    },
    [login, navigate]
  );

  return (
    <AuthLayout>
      <div className={`auth-content auth-split-layout w-full ${mounted ? "auth-revealed" : "auth-pending"}`}>
        <section className="auth-form-side">
          <div className="auth-form-brand"><Logo size={38} /></div>
          <div className="auth-form-heading">
            <p className="auth-card-kicker">YOUR WORKSPACE</p>
            <h1 id="auth-title">Welcome back</h1>
            <p>Sign in to continue working with your documents.</p>
          </div>
          {serverError && <div role="alert" className="mb-5 flex items-center gap-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"><AlertCircle className="h-5 w-5 shrink-0" /><span>{serverError}</span></div>}
          <form onSubmit={handleSubmit(onSubmit)} className="auth-form-fields">
            <Input label="Email" type="email" autoComplete="email" placeholder="Enter your email" icon={<Mail className="h-5 w-5" />} error={errors.email?.message} {...register("email")} />
            <Input label="Password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" icon={<Lock className="h-5 w-5" />} error={errors.password?.message}
              endAdornment={<button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>} {...register("password")} />
            <div className="auth-form-options">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" />Remember me</label>
              <button type="button" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">Forgot password?</button>
            </div>
            <Button type="submit" loading={isSubmitting} iconRight={<ArrowRight className="h-4 w-4" />} className="auth-primary-button h-12 w-full rounded-xl text-sm font-semibold">Sign in</Button>
          </form>
          <p className="auth-switch-copy">New to AI Document Assistant? <Link to="/register">Create an account</Link></p>
          <div className="auth-legal-footer"><p>Securely organized. Ready when you are.</p><nav aria-label="Legal links"><Link to="/terms">Terms</Link><a href="https://ai-doc-assistant-nu.vercel.app/privacy">Privacy</a></nav></div>
        </section>
        <aside className="auth-product-side" aria-label="AI Document Assistant workspace preview">
          <div className="auth-preview-topbar"><div className="auth-window-dots"><i /><i /><i /></div><div className="auth-address"><span className="auth-address-lock">⌑</span> workspace.ai-doc-assistant</div><span className="auth-preview-status"><span /> Secure workspace</span></div>
          <div className="auth-preview-body">
            <div className="auth-preview-copy"><p className="auth-preview-kicker">AI DOCUMENT ASSISTANT</p><h2>Make your documents<br /><span>work smarter.</span></h2><p>Find answers, uncover insights, and keep every important detail within reach.</p></div>
            <div className="auth-dashboard-card">
              <div className="auth-dashboard-header"><div><span className="auth-dashboard-label">WORKSPACE OVERVIEW</span><h3>Your knowledge hub</h3></div><span className="auth-dashboard-mark"><BrainCircuit size={19} /></span></div>
              <div className="auth-metric-grid">
                <div className="auth-metric-card"><span className="auth-metric-icon auth-metric-pink"><FileText size={16} /></span><span className="auth-metric-caption">Documents</span><strong>Organized</strong><small>One searchable space</small></div>
                <div className="auth-metric-card"><span className="auth-metric-icon auth-metric-teal"><Search size={16} /></span><span className="auth-metric-caption">Discovery</span><strong>Smarter search</strong><small>Meaning, not just keywords</small></div>
              </div>
              <div className="auth-activity-panel"><div className="auth-activity-title"><span>Knowledge activity</span><span className="auth-live-dot">● Workspace preview</span></div>
                <svg viewBox="0 0 440 100" role="img" aria-label="Decorative activity graph" className="auth-activity-chart"><defs><linearGradient id="authChartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dba5d7" stopOpacity=".25" /><stop offset="1" stopColor="#dba5d7" stopOpacity="0" /></linearGradient></defs><path d="M0 78 C28 70 36 77 60 59 S96 65 120 49 S155 60 184 40 S225 48 251 30 S287 43 316 22 S350 34 378 17 S414 24 440 8 L440 100 L0 100 Z" fill="url(#authChartFill)" /><path d="M0 78 C28 70 36 77 60 59 S96 65 120 49 S155 60 184 40 S225 48 251 30 S287 43 316 22 S350 34 378 17 S414 24 440 8" fill="none" stroke="#dba5d7" strokeWidth="2.5" strokeLinecap="round" /><path d="M0 98 H440 M0 65 H440 M0 32 H440" stroke="#94a3b8" strokeOpacity=".12" strokeDasharray="3 6" /></svg>
              </div>
            </div>
            <div className="auth-preview-footnote"><Sparkles size={14} /> Less searching. More knowing.</div>
          </div>
        </aside>
      </div>
    </AuthLayout>
  );
}
