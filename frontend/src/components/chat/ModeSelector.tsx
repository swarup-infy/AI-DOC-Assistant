import { memo } from "react";

import type { ChatMode } from "../../services/chatService";

interface ModeSelectorProps {
  mode: ChatMode;
  setMode: (mode: ChatMode) => void;
}

const MODES: ReadonlyArray<{
  id: ChatMode;
  icon: string;
  title: string;
  description: string;
  activeClass: string;
  hoverClass: string;
}> = [
  {
    id: "document",
    icon: "📄",
    title: "Documents",
    description: "Answer only from your uploaded documents.",
    activeClass:
      "border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    hoverClass: "hover:border-blue-400",
  },
  {
    id: "groq",
    icon: "✨",
    title: "Groq AI",
    description: "General-purpose AI conversations.",
    activeClass:
      "border-violet-600 bg-violet-500/10 text-violet-600 dark:text-violet-400",
    hoverClass: "hover:border-violet-400",
  },
  {
    id: "smart",
    icon: "🤖",
    title: "Smart AI",
    description:
      "Searches your documents first, then falls back to Groq.",
    activeClass:
      "border-emerald-600 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    hoverClass: "hover:border-emerald-400",
  },
];

function ModeSelector({
  mode,
  setMode,
}: ModeSelectorProps) {
  return (
    <fieldset className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <legend className="text-xl font-semibold text-card-foreground">
        Choose AI Mode
      </legend>

      <p className="mt-2 text-sm text-muted-foreground">
        Select how you want the assistant to answer your questions.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {MODES.map((item) => {
          const active = item.id === mode;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              aria-pressed={active}
              aria-label={item.title}
              className={`
                rounded-2xl
                border-2
                p-6
                text-left
                transition-all
                duration-200
                focus:outline-none
                focus:ring-2
                focus:ring-primary
                focus:ring-offset-2
                ${
                  active
                    ? `${item.activeClass} shadow-lg`
                    : `border-border bg-card hover:bg-accent hover:shadow-md ${item.hoverClass}`
                }
              `}
            >
              <div
                className="text-5xl"
                aria-hidden="true"
              >
                {item.icon}
              </div>

              <h3 className="mt-4 text-xl font-bold text-card-foreground">
                {item.title}
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default memo(ModeSelector);