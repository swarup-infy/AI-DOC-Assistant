import { memo } from "react";
import { Bot, FileText, Sparkles, type LucideIcon } from "lucide-react";

import type { ChatMode } from "../../services/chatService";

interface ModeSelectorProps {
  mode: ChatMode;
  setMode: (mode: ChatMode) => void;
  showDescriptions?: boolean;
}

const MODES: ReadonlyArray<{
  id: ChatMode;
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    id: "document",
    icon: FileText,
    title: "Documents",
    description: "Answers only from the uploaded document.",
  },
  {
    id: "groq",
    icon: Sparkles,
    title: "Groq AI",
    description: "Answers with Groq using your uploaded document as context.",
  },
  {
    id: "smart",
    icon: Bot,
    title: "Smart AI",
    description: "Searches the document first, then uses Groq when needed.",
  },
];

function ModeSelector({ mode, setMode, showDescriptions = true }: ModeSelectorProps) {
  return (
    <fieldset className="surface rounded-2xl p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <legend className="text-sm font-semibold text-foreground">Choose AI mode</legend>
          {showDescriptions && (
            <p className="mt-1 text-xs text-muted-foreground">
              Pick the way you want the uploaded document to be used.
            </p>
          )}
        </div>
        {!showDescriptions && (
          <span className="text-[11px] font-medium text-muted-foreground">Change mode anytime</span>
        )}
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {MODES.map(({ id, icon: Icon, title, description }) => {
          const active = id === mode;

          return (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              aria-pressed={active}
              className={`group flex items-center gap-3 rounded-xl border text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                showDescriptions ? "p-3.5" : "p-2.5"
              } ${
                active
                  ? "border-primary/45 bg-primary/10 shadow-sm"
                  : "border-border bg-background/40 hover:border-primary/25 hover:bg-muted/50"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:text-primary"
                }`}
              >
                <Icon size={17} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">{title}</span>
                {showDescriptions && (
                  <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                    {description}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default memo(ModeSelector);
