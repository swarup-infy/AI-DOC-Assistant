import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DESKTOP_SIDEBAR_WIDTH = "18rem";

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Close drawer whenever route changes
  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  // ESC key support
  useEffect(() => {
    if (!sidebarOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSidebar();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [sidebarOpen, closeSidebar]);

  // Prevent body scroll while mobile drawer is open
  useEffect(() => {
    if (!sidebarOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Desktop Layout */}
      <div
        className="hidden min-h-screen lg:grid"
        style={{
          gridTemplateColumns: `${DESKTOP_SIDEBAR_WIDTH} minmax(0,1fr)`,
        }}
      >
        {/* Sidebar */}
        <aside className="sticky top-0 h-screen border-r border-border bg-card">
          <Sidebar />
        </aside>

        {/* Main Area */}
        <div className="flex min-h-screen flex-col overflow-hidden">
          <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
            <Navbar onMenuClick={openSidebar} />
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1600px] px-6 py-8 lg:px-10 xl:px-12">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex min-h-screen flex-col lg:hidden">
        {/* Mobile Sidebar */}
        <aside
          aria-hidden={!sidebarOpen}
        className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto will-change-transform border-r border-border bg-card shadow-2xl transition-transform duration-300 ease-out ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
        >
          <div className="sticky top-0 z-10 flex items-center justify-end border-b border-border bg-card p-4">
            <button
              type="button"
              onClick={closeSidebar}
              aria-label="Close menu"
              className="rounded-lg p-2 transition hover:bg-accent"
            >
              <X size={22} />
            </button>
          </div>

          <Sidebar />
        </aside>

        {/* Mobile Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
          <Navbar onMenuClick={openSidebar} />
        </header>

        {/* Mobile Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-5 py-6 sm:px-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}