import {
  memo,
  useId,
} from "react";

import { cn } from "../../lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: number;
}

function Logo({
  className,
  showWordmark = true,
  size = 40,
}: LogoProps) {
  const gradientId = useId();

  return (
    <div
      className={cn(
        "group inline-flex select-none items-center gap-3",
        className
      )}
      role="img"
      aria-label="AI Document Assistant"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className="shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="48"
            y2="48"
          >
            <stop stopColor="var(--primary)" />
            <stop
              offset="0.55"
              stopColor="#8B5CF6"
            />
            <stop
              offset="1"
              stopColor="#06B6D4"
            />
          </linearGradient>
        </defs>

        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="14"
          fill={`url(#${gradientId})`}
        />

        <path
          d="M15 13h12l6 6v16H15V13z"
          fill="white"
          opacity="0.96"
        />

        <path
          d="M27 13v6h6"
          fill="none"
          stroke="#7C3AED"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <line
          x1="19"
          y1="24"
          x2="29"
          y2="24"
          stroke="#7C3AED"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <line
          x1="19"
          y1="28"
          x2="27"
          y2="28"
          stroke="#7C3AED"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <circle
          cx="34"
          cy="15"
          r="2.4"
          fill="#FACC15"
        />

        <path
          d="M34 10v2M34 18v2M30 15h2M36 15h2"
          stroke="#FACC15"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>

      {showWordmark && (
        <div className="min-w-0 leading-tight">
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
            AI Document
          </h1>

          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Assistant
          </p>
        </div>
      )}
    </div>
  );
}

export default memo(Logo);