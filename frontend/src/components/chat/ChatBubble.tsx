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

export default function ChatBubble({
  role,
  message,
  mode,
  sources = [],
}: ChatBubbleProps) {
  function getModeLabel() {
    switch (mode) {
      case "document":
        return "Document AI";
      case "groq":
        return "Groq AI";
      case "smart":
        return "Smart AI";
      default:
        return "AI Assistant";
    }
  }

  if (role === "user") {
    return (
      <div className="mb-6 flex justify-end">
        <div className="max-w-[80%]">
          <div className="mb-2 flex justify-end">
            <div className="flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
              <User size={16} />
              You
            </div>
          </div>

          <div className="rounded-2xl rounded-tr-md bg-primary px-5 py-4 text-primary-foreground shadow-sm">
            <p className="whitespace-pre-wrap leading-7">
              {message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex justify-start">
      <div className="w-full max-w-[90%] space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <Bot
              size={18}
              className="text-primary"
            />
          </div>

          <BubbleHeader
            title={getModeLabel()}
          />
        </div>

        <BubbleContent
          message={message}
        />

        {sources.length > 0 && (
          <SourcesCard
            sources={sources}
          />
        )}

        <BubbleActions
          message={message}
        />
      </div>
    </div>
  );
}
