import { type ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="app-shell auth-shell relative min-h-screen overflow-hidden text-foreground">
      <div className="auth-orb auth-orb-pink" aria-hidden="true" />
      <div className="auth-orb auth-orb-purple" aria-hidden="true" />
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-8 sm:px-8 lg:px-12">
        {children}
      </section>
    </main>
  );
}
