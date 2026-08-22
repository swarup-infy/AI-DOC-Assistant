import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
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

const STORAGE_KEY = "theme";
type Theme = "light" | "dark";

const isTheme = (value: string | null): value is Theme =>
  value === "dark" || value === "light";

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";

  const saved = localStorage.getItem(STORAGE_KEY);
  if (isTheme(saved)) return saved;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};

const iconButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-border bg-card/70 text-muted-foreground transition-all duration-200 hover:border-border-strong hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const darkMode = theme === "dark";

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemTheme = (event: MediaQueryListEvent) => {
      if (localStorage.getItem(STORAGE_KEY)) return;
      setTheme(event.matches ? "dark" : "light");
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && isTheme(event.newValue)) {
        setTheme(event.newValue);
      }
    };

    media.addEventListener?.("change", handleSystemTheme);
    window.addEventListener("storage", handleStorage);

    return () => {
      media.removeEventListener?.("change", handleSystemTheme);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      return next;
    });
  }, []);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value),
    []
  );

  const handleProfile = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const handleLogout = useCallback(() => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const displayName = useMemo(() => user?.name ?? "Profile", [user]);

  return (
    <div className="flex h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className={`${iconButtonClass} h-10 w-10 lg:hidden`}
        >
          <Menu size={19} />
        </button>

        <div className="min-w-0">
          <p className="hidden text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground sm:block">
            Workspace
          </p>
          <h1 className="truncate font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            AI Document Assistant
          </h1>
        </div>
      </div>

      <div role="search" className="hidden min-w-0 flex-1 justify-center px-5 md:flex">
        <div className="flex w-full max-w-[560px] items-center gap-3 rounded-xl border border-border bg-card/65 px-3.5 py-2.5 shadow-sm transition-all focus-within:border-primary/60 focus-within:bg-card focus-within:ring-4 focus-within:ring-primary/10">
          <Search size={17} className="shrink-0 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search documents, chats, PDFs..."
            aria-label="Search documents"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline-block">
            /
          </kbd>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label="Search"
          className={`${iconButtonClass} h-10 w-10 md:hidden`}
        >
          <Search size={18} />
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={darkMode ? "Light mode" : "Dark mode"}
          className={`${iconButtonClass} h-10 w-10`}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          onClick={handleProfile}
          aria-label="Open profile"
          title="Profile"
          className="hidden h-10 items-center gap-2.5 rounded-xl border border-border bg-card/70 px-3 transition-all hover:border-border-strong hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary sm:flex"
        >
          <UserCircle size={20} className="text-muted-foreground" />
          <div className="hidden text-left lg:block">
            <p className="text-[10px] leading-3 text-muted-foreground">Welcome</p>
            <p className="max-w-[130px] truncate text-xs font-semibold text-foreground" title={displayName}>
              {displayName}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-3.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <LogOut size={17} />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default memo(Navbar);
