import { useEffect, type ReactNode } from "react";
import styles from "./AuthLayout.module.css";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  useEffect(() => {
    // Start waking a sleeping hosted API while the user reads the form.
    // This request is intentionally non-blocking and never affects rendering.
    if (!["/login", "/register"].includes(window.location.pathname)) return;

    const apiUrl =
      import.meta.env.VITE_API_URL ??
      (import.meta.env.PROD
        ? "https://ai-doc-assistant-aw9f.onrender.com/api"
        : "http://127.0.0.1:8000/api");
    const apiRoot = apiUrl.replace(/\\/api\\/?$/, "");

    void fetch(`${apiRoot}/health`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    }).catch(() => {
      // The login form remains usable if the API is unavailable.
    });
  }, []);

  return (
    <main className={`auth-shell relative min-h-screen overflow-hidden text-foreground ${styles.shell}`}>
      <div className={styles.backgroundRibbons} aria-hidden="true" />
      <div className={styles.pinkOrb} aria-hidden="true" />
      <div className={styles.purpleOrb} aria-hidden="true" />
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-8 sm:px-8 lg:px-12">
        {children}
      </section>
    </main>
  );
}
