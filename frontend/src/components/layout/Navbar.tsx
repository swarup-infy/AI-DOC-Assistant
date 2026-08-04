import { useCallback, useEffect, useState } from "react";
import {
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  UserCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({
  onMenuClick,
}: NavbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const theme =
      localStorage.getItem("theme") ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    setDarkMode(theme === "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      const theme = next ? "dark" : "light";

      document.documentElement.setAttribute(
        "data-theme",
        theme
      );

      localStorage.setItem("theme", theme);

      return next;
    });
  }, []);

  const handleLogout = useCallback(() => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) return;

    logout();

    navigate("/login", {
      replace: true,
    });
  }, [logout, navigate]);

  return (
    <header className="flex h-20 items-center justify-between gap-4 px-5 sm:px-8">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-xl p-3 transition hover:bg-accent lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Workspace
          </p>

          <h1 className="font-display truncate text-2xl font-light leading-none text-foreground sm:text-3xl">
            AI Document Assistant
          </h1>
        </div>
      </div>

      {/* Desktop Search */}
      <div
        className="hidden flex-1 justify-center px-8 lg:flex"
        role="search"
      >
        <div className="flex w-full max-w-xl items-center gap-3 rounded-full border border-border bg-card px-5 py-3 transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
          <Search
            size={18}
            className="flex-shrink-0 text-muted-foreground"
          />

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents, chats, PDFs..."
            aria-label="Search documents"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search */}
        <button
          type="button"
          aria-label="Search"
          className="rounded-2xl border border-border p-3 transition hover:bg-accent lg:hidden"
        >
          <Search size={18} />
        </button>

        {/* Theme */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          className="will-change-transform rounded-2xl border border-border p-3 transition hover:bg-accent"
        >
          {darkMode ? (
            <Sun size={19} />
          ) : (
            <Moon size={19} />
          )}
        </button>

        {/* Profile */}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          aria-label="Open profile"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition hover:border-primary/30 hover:bg-accent"
        >
          <UserCircle size={22} />

          <div className="hidden text-left lg:block">
            <p className="text-xs text-muted-foreground">
              Welcome
            </p>

            <p className="text-sm font-medium text-foreground">
              {user?.full_name ??
                user?.username ??
                "Profile"}
            </p>
          </div>
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Logout"
          className="will-change-transform flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
        >
          <LogOut size={18} />

          <span className="hidden md:inline">
            Logout
          </span>
        </button>
      </div>
    </header>
  );
}