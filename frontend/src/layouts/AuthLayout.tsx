import { type ReactNode } from "react";
import styles from "./AuthLayout.module.css";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
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
