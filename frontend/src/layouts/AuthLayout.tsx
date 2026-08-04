import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <main
      role="main"
      className="flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-10 transition-colors duration-300"
    >
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl transition-colors duration-300">
        {children}
      </section>
    </main>
  );
}