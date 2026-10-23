import { type ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

function NetworkArtwork() {
  return (
    <div className="auth-art-drift pointer-events-none absolute inset-0 hidden overflow-hidden lg:block" aria-hidden="true">
      <svg viewBox="0 0 560 380" className="absolute right-[-2rem] top-1/2 w-[min(48vw,560px)] -translate-y-1/2 opacity-80" fill="none">
        <g stroke="#376E6F" strokeOpacity=".65" strokeWidth="1.2">
          <path d="M65 94 190 42 326 103 454 67 495 218 350 291 205 246 65 94Z" />
          <path d="M190 42 205 246 326 103 350 291M65 94 326 103 495 218M205 246 454 67" />
          <path d="M326 103 420 168 350 291" stroke="#DA7B93" strokeOpacity=".75" />
        </g>
        <g fill="#DA7B93" className="auth-node">
          <circle cx="65" cy="94" r="5" /><circle cx="190" cy="42" r="8" />
          <circle cx="326" cy="103" r="6" /><circle cx="454" cy="67" r="4" />
          <circle cx="495" cy="218" r="7" /><circle cx="350" cy="291" r="5" />
          <circle cx="205" cy="246" r="9" /><circle cx="420" cy="168" r="3" />
        </g>
        <g fill="#376E6F"><circle cx="112" cy="190" r="3"/><circle cx="274" cy="184" r="4"/><circle cx="420" cy="265" r="3"/></g>
      </svg>
    </div>
  );
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="auth-shell app-shell relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="auth-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-[#DA7B93]/10 blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-48 right-[-8rem] h-[38rem] w-[38rem] rounded-full bg-[#376E6F]/20 blur-[130px]" aria-hidden="true" />
      <NetworkArtwork />
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] items-center px-5 py-8 sm:px-8 sm:py-12 lg:px-12">
        <div className="w-full auth-enter">{children}</div>
      </section>
    </main>
  );
}
