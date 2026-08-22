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

const DESKTOP_SIDEBAR_WIDTH = "256px";

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSidebar();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, closeSidebar]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="app-shell min-h-screen bg-background text-foreground">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Desktop */}
      <div
        className="hidden min-h-screen lg:grid"
        style={{
          gridTemplateColumns: `${DESKTOP_SIDEBAR_WIDTH} minmax(0, 1fr)`,
        }}
      >
        <aside className="sticky top-0 h-screen min-h-0 border-r border-border bg-card/90">
          <Sidebar />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-col">
          <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-2xl">
            <Navbar onMenuClick={openSidebar} />
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1440px] px-6 py-8 md:px-8 lg:px-10 xl:px-12 xl:py-10">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile / tablet */}
      <div className="flex min-h-screen flex-col lg:hidden">
        <aside
          aria-hidden={!sidebarOpen}
          className={`fixed inset-y-0 left-0 z-50 w-[min(86vw,20rem)] overflow-y-auto border-r border-border bg-card shadow-2xl transition-transform duration-300 ease-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="sticky top-0 z-10 flex h-16 items-center justify-end border-b border-border bg-card/95 px-4 backdrop-blur-xl">
            <button
              type="button"
              onClick={closeSidebar}
              aria-label="Close navigation menu"
              className="rounded-xl border border-border p-2.5 text-muted-foreground transition hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <X size={20} />
            </button>
          </div>
          <Sidebar />
        </aside>

        <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-2xl">
          <Navbar onMenuClick={openSidebar} />
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
