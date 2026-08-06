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
  if (typeof window === "undefined") {
    return "light";
  }

  const saved = localStorage.getItem(STORAGE_KEY);

  if (isTheme(saved)) {
    return saved;
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";
};

const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute(
    "data-theme",
    theme
  );
};

const iconButtonClass =
  "rounded-2xl border border-border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2";

function Navbar({
  onMenuClick,
}: NavbarProps) {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [search, setSearch] = useState("");

  const [theme, setTheme] =
    useState<Theme>(getInitialTheme);

  const darkMode = theme === "dark";

  // Apply the theme attribute on mount (covers SSR/hydration case
  // where getInitialTheme() couldn't touch the DOM).
  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleSystemTheme = (
      event: MediaQueryListEvent
    ) => {
      if (
        localStorage.getItem(STORAGE_KEY)
      ) {
        return;
      }

      const nextTheme: Theme =
        event.matches ? "dark" : "light";

      setTheme(nextTheme);
      applyTheme(nextTheme);
    };

    const handleStorage = (
      event: StorageEvent
    ) => {
      if (
        event.key !== STORAGE_KEY ||
        !isTheme(event.newValue)
      ) {
        return;
      }

      const nextTheme = event.newValue;

      setTheme(nextTheme);
      applyTheme(nextTheme);
    };

    // Safari < 14 fallback (no addEventListener on MediaQueryList)
    if (media.addEventListener) {
      media.addEventListener("change", handleSystemTheme);
    } else {
      media.addListener(handleSystemTheme);
    }

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", handleSystemTheme);
      } else {
        media.removeListener(handleSystemTheme);
      }

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme =
        current === "dark"
          ? "light"
          : "dark";

      applyTheme(next);

      localStorage.setItem(
        STORAGE_KEY,
        next
      );

      return next;
    });
  }, []);

  const handleSearchChange =
    useCallback(
      (
        event: ChangeEvent<HTMLInputElement>
      ) => {
        setSearch(event.target.value);
      },
      []
    );

  const handleProfile =
    useCallback(() => {
      navigate("/profile");
    }, [navigate]);

  const handleLogout = useCallback(() => {
    if (
      !window.confirm(
        "Are you sure you want to logout?"
      )
    ) {
      return;
    }

    logout();

    navigate("/login", {
      replace: true,
    });
  }, [
    logout,
    navigate,
  ]);

  const displayName = useMemo(
    () =>
      user?.full_name ??
      user?.username ??
      "Profile",
    [user]
  );

  return (
    <header className="flex h-20 items-center justify-between gap-4 px-5 sm:px-8">
      {/* Left */}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className={`${iconButtonClass} p-3 hover:bg-accent lg:hidden`}
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
        role="search"
        className="hidden flex-1 justify-center px-8 lg:flex"
      >
        <div className="flex w-full max-w-xl items-center gap-3 rounded-full border border-border bg-card px-5 py-3 transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
          <Search
            size={18}
            className="shrink-0 text-muted-foreground"
          />

          <input
            type="search"
            value={search}
            onChange={
              handleSearchChange
            }
            placeholder="Search documents, chats, PDFs..."
            aria-label="Search documents"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="search"
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
          className={`${iconButtonClass} p-3 hover:bg-accent lg:hidden`}
        >
          <Search size={18} />
        </button>

        {/* Theme Toggle */}

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          title={
            darkMode
              ? "Light mode"
              : "Dark mode"
          }
          className={`${iconButtonClass} p-3 hover:bg-accent`}
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
          onClick={handleProfile}
          aria-label="Open profile"
          title="Profile"
          className={`${iconButtonClass} flex items-center gap-3 bg-card px-4 py-3 hover:border-primary/30 hover:bg-accent`}
        >
          <UserCircle
            size={22}
            className="shrink-0"
          />

          <div className="hidden text-left lg:block">
            <p className="text-xs text-muted-foreground">
              Welcome
            </p>

            <p
              className="max-w-[180px] truncate text-sm font-medium text-foreground"
              title={displayName}
            >
              {displayName}
            </p>
          </div>
        </button>

        {/* Logout */}

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
          className="
            flex
            items-center
            gap-2
            rounded-2xl
            bg-primary
            px-5
            py-3
            text-primary-foreground
            transition-all
            duration-200
            hover:scale-[1.02]
            hover:shadow-lg
            hover:shadow-primary/25
            active:scale-[0.98]
            focus:outline-none
            focus:ring-2
            focus:ring-primary
            focus:ring-offset-2
          "
        >
          <LogOut
            size={18}
            className="shrink-0"
          />

          <span className="hidden md:inline">
            Logout
          </span>
        </button>
      </div>
    </header>
  );
}

export default memo(Navbar);