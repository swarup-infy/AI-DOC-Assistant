import { useState, type ReactNode } from "react";
import { X } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border/60 bg-card lg:block">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-border/60 bg-card transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-accent"
          >
            <X size={22} />
          </button>
        </div>

        <Sidebar />
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-col lg:ml-72">
        {/* Navbar */}
        <header className="sticky top-0 z-50 h-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <Navbar
            onMenuClick={() => setSidebarOpen(true)}
          />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-8 py-10 xl:px-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}