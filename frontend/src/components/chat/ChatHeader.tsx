import { memo, useMemo } from "react";
import { Bot, FileText, Sparkles } from "lucide-react";

import type { ChatMode } from "../../services/chatService";

interface ChatHeaderProps {
  mode: ChatMode;
}

const MODE_INFO: Record<ChatMode, { icon: typeof FileText; title: string; description: string }> = {
  document: {
    icon: FileText,
    title: "Document AI",
    description: "Grounded answers from your uploaded documents.",
  },
  groq: {
    icon: Sparkles,
    title: "Groq AI",
    description: "General-purpose conversations powered by Groq.",
  },
  smart: {
    icon: Bot,
    title: "Smart AI",
    description: "Searches your documents first, then uses Groq when needed.",
  },
};

function ChatHeader({ mode }: ChatHeaderProps) {
  const current = useMemo(() => MODE_INFO[mode], [mode]);
  const Icon = current.icon;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-primary/12 blur-3xl" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <Icon size={14} />
            {current.title}
          </div>
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            AI Document Assistant
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {current.description}
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bot size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Assistant ready</p>
            <p className="text-[11px] text-muted-foreground">Powered by Groq</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(ChatHeader);
