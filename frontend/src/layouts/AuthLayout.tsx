import { type ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

const backgroundParticles = [
  "particle-one",
  "particle-two",
  "particle-three",
  "particle-four",
  "particle-five",
  "particle-six",
  "particle-seven",
  "particle-eight",
];

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="app-shell auth-shell relative min-h-screen overflow-hidden text-foreground">
      <div className="auth-grain" aria-hidden="true">
        <div className="auth-particles">
          {backgroundParticles.map((particle) => (
            <span key={particle} className={`auth-particle ${particle}`} />
          ))}
        </div>
      </div>
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-8 sm:px-8 lg:px-12">
        {children}
      </section>
    </main>
  );
}
