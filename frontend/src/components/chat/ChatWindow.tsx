import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";

import type {
  ChatMode,
  Source,
} from "../../services/chatService";

import ChatBubble from "./ChatBubble";
import ThinkingBubble from "./ThinkingBubble";

interface Message {
  role: "user" | "assistant";
  content: string;
  mode?: ChatMode;
  sources?: Source[];
}

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
}

export default function ChatWindow({
  messages,
  loading,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  return (
    <div className="h-[520px] overflow-y-auto bg-muted/30 p-6">
      {messages.length === 0 && !loading && (
        <div className="flex h-full items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Bot
                size={30}
                className="text-primary"
              />
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-foreground">
              AI Document Assistant
            </h2>

            <p className="mt-2 text-muted-foreground">
              Ask questions about your uploaded documents, search
              information, or get AI-powered summaries.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {messages.map((message, index) => (
          <ChatBubble
            key={index}
            role={message.role}
            message={message.content}
            mode={message.mode}
            sources={message.sources}
          />
        ))}

        {loading && <ThinkingBubble />}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}