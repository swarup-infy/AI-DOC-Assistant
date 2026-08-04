import {
  Bot,
  FileText,
  Sparkles,
} from "lucide-react";

import type { ChatMode } from "../../services/chatService";

interface ChatHeaderProps {
  mode: ChatMode;
}

export default function ChatHeader({
  mode,
}: ChatHeaderProps) {
  const modeInfo = {
    document: {
      icon: <FileText size={16} />,
      title: "Document AI",
      description:
        "Answers are generated only from your uploaded documents.",
      color:
        "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },

    groq: {
      icon: <Sparkles size={16} />,
      title: "Groq AI",
      description:
        "General conversations powered by Groq.",
      color:
        "bg-violet-500/10 text-violet-500 border-violet-500/20",
    },

    smart: {
      icon: <Bot size={16} />,
      title: "Smart AI",
      description:
        "Searches documents first and intelligently falls back to Gemini.",
      color:
        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
  };

  const current = modeInfo[mode];

  return (
    <section className="mb-10 overflow-hidden rounded-[34px] border border-border/60 bg-card shadow-sm">
      <div className="grid items-center gap-10 p-10 lg:grid-cols-[1.2fr_420px]">
        {/* Left */}
        <div>
          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${current.color}`}
          >
            {current.icon}
            {current.title}
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
            Upload, organize, search and chat with your
            documents using an intelligent AI assistant built
            for productivity.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-full border border-border bg-muted px-5 py-2 text-sm">
              📄 PDF
            </div>

            <div className="rounded-full border border-border bg-muted px-5 py-2 text-sm">
              📑 DOCX
            </div>

            <div className="rounded-full border border-border bg-muted px-5 py-2 text-sm">
              📊 Excel
            </div>

            <div className="rounded-full border border-border bg-muted px-5 py-2 text-sm">
              🤖 AI Chat
            </div>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="hidden lg:flex justify-center">
          <div className="relative h-[320px] w-[320px]">
            {/* Glow */}
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl" />

            {/* Main Circle */}
            <div className="absolute left-1/2 top-1/2 flex h-56 w-56 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-xl">
              <Bot
                size={90}
                className="text-primary"
              />
            </div>

            {/* Floating Cards */}

            <div className="absolute left-2 top-8 rotate-[-10deg] rounded-2xl border border-border bg-card p-5 shadow-lg">
              📄
            </div>

            <div className="absolute right-3 top-14 rotate-[12deg] rounded-2xl border border-border bg-card p-5 shadow-lg">
              ✨
            </div>

            <div className="absolute bottom-10 left-8 rotate-[8deg] rounded-2xl border border-border bg-card p-5 shadow-lg">
              📊
            </div>

            <div className="absolute bottom-3 right-6 rotate-[-8deg] rounded-2xl border border-border bg-card p-5 shadow-lg">
              💬
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-muted/40 px-10 py-5">
        <p className="text-sm text-muted-foreground">
          {current.description}
        </p>
      </div>
    </section>
  );
}
