import { memo, useMemo } from "react";
import { Bot, User } from "lucide-react";

import type {
  ChatMode,
  Source,
} from "../../services/chatService";

import BubbleActions from "./BubbleActions";
import BubbleContent from "./BubbleContent";
import BubbleHeader from "./BubbleHeader";
import SourcesCard from "./SourcesCard";

interface ChatBubbleProps {
  role: "user" | "assistant";
  message: string;
  mode?: ChatMode;
  sources?: Source[];
}

const MODE_LABELS: Record<ChatMode, string> = {
  smart: "Smart AI",
  document: "Document AI",
  groq: "Groq AI",
};

function ChatBubble({
  role,
  message,
  mode,
  sources = [],
}: ChatBubbleProps) {
  const title = useMemo(() => {
    if (!mode) return "AI Assistant";
    return MODE_LABELS[mode] ?? "AI Assistant";
  }, [mode]);

  const isUser = role === "user";

  if (isUser) {
    return (
      <article
        className="mb-6 flex justify-end"
        aria-label="User message"
      >
        <div className="max-w-[80%]">
          <header className="mb-2 flex justify-end">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
              <User size={16} />
              <span>You</span>
            </div>
          </header>

          <div className="rounded-2xl rounded-tr-md bg-primary px-5 py-4 text-primary-foreground shadow-sm">
            <p className="whitespace-pre-wrap break-words leading-7">
              {message}
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className="mb-6 flex justify-start"
      aria-label="Assistant message"
    >
      <div className="w-full max-w-[90%] space-y-3">
        <header className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <Bot
              size={18}
              className="text-primary"
            />
          </div>

          <BubbleHeader title={title} />
        </header>

        <BubbleContent message={message} />

        {sources.length > 0 && (
          <SourcesCard sources={sources} />
        )}

        <BubbleActions message={message} />
      </div>
    </article>
  );
}

export default memo(ChatBubble);