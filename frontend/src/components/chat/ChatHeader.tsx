import { memo, useMemo } from "react";
import {
  Bot,
  FileText,
  Sparkles,
} from "lucide-react";

import type { ChatMode } from "../../services/chatService";

interface ChatHeaderProps {
  mode: ChatMode;
}

const FEATURES = [
  "📄 PDF",
  "📑 DOCX",
  "📊 Excel",
  "🤖 AI Chat",
] as const;

const MODE_INFO: Record<
  ChatMode,
  {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
  }
> = {
  document: {
    icon: <FileText size={16} />,
    title: "Document AI",
    description:
      "Answers are generated exclusively from your uploaded documents.",
    color:
      "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },

  groq: {
    icon: <Sparkles size={16} />,
    title: "Groq AI",
    description:
      "General-purpose conversations powered by Groq.",
    color:
      "bg-violet-500/10 text-violet-500 border-violet-500/20",
  },

  smart: {
    icon: <Bot size={16} />,
    title: "Smart AI",
    description:
      "Searches your documents first and falls back to Groq when needed.",
    color:
      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
};

function ChatHeader({
  mode,
}: ChatHeaderProps) {
  const current = useMemo(
    () => MODE_INFO[mode],
    [mode]
  );

  return (
    <header
      aria-label="Chat header"
      className="mb-10 overflow-hidden rounded-[34px] border border-border/60 bg-card shadow-sm"
    >
      <div className="grid items-center gap-10 p-10 lg:grid-cols-[1.2fr_420px]">
        {/* Left */}

        <div>
          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${current.color}`}
          >
            {current.icon}
            <span>{current.title}</span>
          </div>

          <h1
            className="leading-[0.95] text-6xl font-light tracking-tight text-foreground lg:text-7xl"
            style={{
              fontFamily:
                '"Cormorant Garamond","Playfair Display",serif',
            }}
          >
            AI Document
            <br />
            Assistant
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Upload, organize, search, summarize, and chat
            with your documents using an intelligent AI
            assistant built for productivity.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {FEATURES.map((feature) => (
              <div
                key={feature}
                className="rounded-full border border-border bg-muted px-5 py-2 text-sm"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Right */}

        <div className="hidden justify-center lg:flex">
          <div className="relative h-[320px] w-[320px]">
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl" />

            <div className="absolute left-1/2 top-1/2 flex h-56 w-56 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-xl">
              <Bot
                size={90}
                className="text-primary"
              />
            </div>

            {[
              {
                emoji: "📄",
                className:
                  "left-2 top-8 -rotate-12",
              },
              {
                emoji: "✨",
                className:
                  "right-3 top-14 rotate-12",
              },
              {
                emoji: "📊",
                className:
                  "bottom-10 left-8 rotate-6",
              },
              {
                emoji: "💬",
                className:
                  "bottom-3 right-6 -rotate-6",
              },
            ].map(({ emoji, className }) => (
              <div
                key={emoji}
                className={`absolute rounded-2xl border border-border bg-card p-5 shadow-lg ${className}`}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-muted/40 px-10 py-5">
        <p className="text-sm text-muted-foreground">
          {current.description}
        </p>
      </div>
    </header>
  );
}

export default memo(ChatHeader);