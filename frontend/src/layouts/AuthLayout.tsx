import { type ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background">
      {/* Aurora Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="auth-aurora auth-aurora-a absolute -left-48 -top-48 h-[40rem] w-[40rem] rounded-full bg-primary/25 blur-[140px]" />

        <div className="auth-aurora auth-aurora-b absolute -right-56 top-1/4 h-[34rem] w-[34rem] rounded-full bg-fuchsia-500/20 blur-[140px]" />

        <div className="auth-aurora auth-aurora-c absolute bottom-[-14rem] left-1/3 h-[32rem] w-[32rem] rounded-full bg-cyan-400/20 blur-[140px]" />
      </div>

      {/* Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right,currentColor 1px,transparent 1px),linear-gradient(to bottom,currentColor 1px,transparent 1px)",
          backgroundSize: "56px 56px",
          color: "currentColor",
          maskImage:
            "radial-gradient(circle at center,black 40%,transparent 85%)",
        }}
      />

      {/* Radial vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.18)_100%)]"
      />

      {/* Content */}
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        {children}
      </section>
    </main>
  );
}