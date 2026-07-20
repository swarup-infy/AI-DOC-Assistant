import { ReactNode } from "react";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: Props) {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 min-h-screen bg-slate-100">
        <Navbar />

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}