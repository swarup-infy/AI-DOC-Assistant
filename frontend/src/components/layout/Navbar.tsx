import { useEffect, useState } from "react";
import {
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  UserCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({
  onMenuClick,
}: NavbarProps) {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    document.documentElement.setAttribute(
      "data-theme",
      savedTheme
    );

    setDarkMode(savedTheme === "dark");
  }, []);

  function toggleTheme() {
    const nextTheme = darkMode ? "light" : "dark";

    setDarkMode(!darkMode);

    document.documentElement.setAttribute(
      "data-theme",
      nextTheme
    );

    localStorage.setItem("theme", nextTheme);
  }

  function logout() {
    if (!window.confirm("Are you sure you want to logout?")) {
      return;
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  }

  return (
    <header className="flex h-20 items-center justify-between px-8">
      {/* Left */}
      <div className="flex items-center gap-5">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-3 transition hover:bg-accent lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Workspace
          </p>

          <h1
            className="text-3xl font-light leading-none text-foreground"
            style={{
              fontFamily:
                '"Cormorant Garamond","Playfair Display",serif',
            }}
          >
            AI Document Assistant
          </h1>
        </div>
      </div>

      {/* Search */}
      <div className="hidden flex-1 justify-center px-10 lg:flex">
        <div className="relative w-full max-w-xl">
          <Search
            size={18}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents, chats, PDFs..."
            className="
              w-full
              rounded-full
              border
              border-border
              bg-card
              py-3
              pl-16
              pr-5
              text-sm
              text-foreground
              outline-none
              transition-all
              focus:border-primary
              focus:ring-4
              focus:ring-primary/15
            "
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-2xl border border-border p-3 transition hover:bg-accent"
          aria-label="Toggle Theme"
        >
          {darkMode ? (
            <Sun size={19} />
          ) : (
            <Moon size={19} />
          )}
        </button>

        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition hover:border-primary/30 hover:bg-accent"
        >
          <UserCircle size={22} />

          <div className="hidden text-left lg:block">
            <p className="text-xs text-muted-foreground">
              Welcome
            </p>

            <p className="text-sm font-medium text-foreground">
              Profile
            </p>
          </div>
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
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