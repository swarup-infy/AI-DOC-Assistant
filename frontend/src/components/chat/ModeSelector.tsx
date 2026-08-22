import { memo } from "react";
import { Bot, FileText, Sparkles, type LucideIcon } from "lucide-react";

import type { ChatMode } from "../../services/chatService";

interface ModeSelectorProps {
  mode: ChatMode;
  setMode: (mode: ChatMode) => void;
}

const MODES: ReadonlyArray<{
  id: ChatMode;
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  { id: "document", icon: FileText, title: "Documents", description: "Answer from your uploaded knowledge base." },
  { id: "groq", icon: Sparkles, title: "Groq AI", description: "General-purpose AI conversations." },
  { id: "smart", icon: Bot, title: "Smart AI", description: "Search documents first, then use Groq when needed." },
];

function ModeSelector({ mode, setMode }: ModeSelectorProps) {
  return (
    <fieldset className="surface rounded-2xl p-4 sm:p-5">
      <legend className="px-1 text-sm font-semibold text-foreground">Choose AI mode</legend>
      <p className="mt-1 text-xs text-muted-foreground">Select how the assistant should answer your question.</p>

      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {MODES.map(({ id, icon: Icon, title, description }) => {
          const active = id === mode;

          return (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              aria-pressed={active}
              className={`group flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                active
                  ? "border-primary/40 bg-primary/10 shadow-sm"
                  : "border-border bg-background/40 hover:border-primary/25 hover:bg-muted/50"
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-primary"}`}>
                <Icon size={17} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">{title}</span>
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default memo(ModeSelector);
