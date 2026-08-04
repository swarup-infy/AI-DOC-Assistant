import { cn } from "../../lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

/**
 * Mark is the same five-bar "pulse" motif used for the thinking
 * indicator elsewhere in the app — the logo IS the loading state,
 * just frozen mid-gesture. Keeps the brand and the product's core
 * behavior (listening / responding) visually the same idea.
 */
export default function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect width="28" height="28" rx="8" fill="url(#logo-grad)" />
        <g stroke="white" strokeWidth="2" strokeLinecap="round">
          <line x1="8" y1="11" x2="8" y2="17" opacity="0.85" />
          <line x1="12" y1="8" x2="12" y2="20" />
          <line x1="16" y1="6" x2="16" y2="22" />
          <line x1="20" y1="10" x2="20" y2="18" opacity="0.85" />
        </g>
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C5CFF" />
            <stop offset="1" stopColor="#45E0C9" />
          </linearGradient>
        </defs>
      </svg>
      {showWordmark && (
        <span className="font-display text-lg font-semibold tracking-tight text-[var(--fg)]">
          Docent
        </span>
      )}
    </div>
  );
}