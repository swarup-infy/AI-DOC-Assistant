import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function AuthLayout({
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8">
        {children}
      </div>
    </div>
  );
}