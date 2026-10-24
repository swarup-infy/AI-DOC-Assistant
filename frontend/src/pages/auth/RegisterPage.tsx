import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
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
    return (
    <AuthLayout>
      <div className={`auth-content auth-split-layout auth-register-layout w-full ${mounted ? "auth-revealed" : "auth-pending"}`}>
        <section className="auth-form-side auth-register-form">
          <div className="auth-form-brand"><Logo size={38} /></div>
          <div className="auth-form-heading">
            <p className="auth-card-kicker">START YOUR WORKSPACE</p>
            <h1 id="auth-title">Create your account</h1>
            <p>A calmer, smarter home for all your documents.</p>
          </div>

          {serverError && (
            <div role="alert" className="mb-4 flex items-center gap-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle size={18} className="shrink-0" /><span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form-fields auth-register-fields">
            <Input label="Full name" placeholder="Your name" autoComplete="name" icon={<User size={18} />}
              error={errors.name?.message} {...register("name")} />
            <Input label="Email address" type="email" placeholder="you@company.com" autoComplete="email" icon={<Mail size={18} />}
              error={errors.email?.message} {...register("email")} />
            <div className="relative">
              <Input label="Password" type={showPassword ? "text" : "password"} placeholder="Create a password"
                autoComplete="new-password" icon={<Lock size={18} />} error={errors.password?.message}
                endAdornment={<button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
                {...register("password")} />
            </div>
            <div className="auth-password-strength">
              <div className="auth-strength-track"><div className={`auth-strength-fill ${strengthColor}`} style={{width:`${passwordStrength * 25}%`}} /></div>
              <span>Password strength: <strong>{password.length ? strengthLabel : "Not set"}</strong></span>
            </div>
            <div className="relative">
              <Input label="Confirm password" type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter your password"
                autoComplete="new-password" icon={<Lock size={18} />} error={errors.confirmPassword?.message}
                endAdornment={<button type="button" onClick={() => setShowConfirmPassword(v => !v)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
                {...register("confirmPassword")} />
            </div>
            <label className="auth-terms-check">
              <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 rounded accent-primary" required />
              <span>I agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.</span>
            </label>
            <Button type="submit" loading={isSubmitting} iconRight={<ArrowRight size={18} />}
              className="auth-primary-button h-12 w-full rounded-xl text-sm font-semibold">Create account</Button>
          </form>
          <p className="auth-switch-copy">Already have an account? <Link to="/login">Sign in</Link></p>
          <div className="auth-legal-footer"><p>Your workspace, ready to grow with you.</p></div>
        </section>

        <aside className="auth-product-side" aria-label="AI Document Assistant workspace preview">
          <div className="auth-preview-topbar">
            <div className="auth-window-dots"><i /><i /><i /></div>
            <div className="auth-address"><span className="auth-address-lock">⌑</span> workspace.ai-doc-assistant</div>
            <span className="auth-preview-status"><span /> Private by design</span>
          </div>
          <div className="auth-preview-body">
            <div className="auth-preview-copy">
              <p className="auth-preview-kicker">YOUR KNOWLEDGE, CONNECTED</p>
              <h2>Everything in one place.<br /><span>Clarity in every file.</span></h2>
              <p>Bring your documents together and make the information inside them easier to find.</p>
            </div>
            <div className="auth-dashboard-card">
              <div className="auth-dashboard-header">
                <div><span className="auth-dashboard-label">YOUR AI WORKSPACE</span><h3>Built around your work</h3></div>
                <span className="auth-dashboard-mark"><BrainCircuit size={19} /></span>
              </div>
              <div className="auth-feature-list">
                <div><span className="auth-feature-icon auth-metric-pink"><FileText size={17} /></span><span><strong>All your documents</strong><small>Keep important files in one organized space</small></span><ArrowRight size={16} /></div>
                <div><span className="auth-feature-icon auth-metric-teal"><Search size={17} /></span><span><strong>Semantic search</strong><small>Find the right detail without digging</small></span><ArrowRight size={16} /></div>
                <div><span className="auth-feature-icon auth-metric-violet"><Sparkles size={17} /></span><span><strong>AI-powered answers</strong><small>Ask questions and explore your knowledge</small></span><ArrowRight size={16} /></div>
              </div>
              <div className="auth-preview-note"><span className="auth-live-dot">●</span> A more thoughtful way to work</div>
            </div>
            <div className="auth-preview-footnote"><Sparkles size={14} /> Less searching. More knowing.</div>
          </div>
        </aside>
      </div>
    </AuthLayout>
  );
}
