import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10 transition-colors duration-300">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl transition-colors duration-300">
        {children}
      </div>
    </div>
  );
}