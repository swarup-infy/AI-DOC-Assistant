import { type ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="app-shell relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -left-48 -top-48 h-[38rem] w-[38rem] rounded-full bg-primary/14 blur-[130px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-48 top-1/4 h-[34rem] w-[34rem] rounded-full bg-secondary/10 blur-[130px]" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-[-16rem] left-1/3 h-[34rem] w-[34rem] rounded-full bg-primary/8 blur-[130px]" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" style={{ backgroundImage: "linear-gradient(to right,var(--border) 1px,transparent 1px),linear-gradient(to bottom,var(--border) 1px,transparent 1px)", backgroundSize: "56px 56px", maskImage: "linear-gradient(to bottom,black,transparent 80%)" }} />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-8 sm:px-8 sm:py-12 lg:px-12">
        {children}
      </section>
    </main>
  );
}
