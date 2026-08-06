import {
  memo,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { Bot } from "lucide-react";

import type {
  ChatMode,
  Source,
} from "../../services/chatService";

import ChatBubble from "./ChatBubble";
import ThinkingBubble from "./ThinkingBubble";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  mode?: ChatMode;
  sources?: Source[];
}

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
}

const EmptyState = memo(function EmptyState() {
  return (
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
          Ask questions about your uploaded documents,
          search information, or generate AI-powered
          summaries.
        </p>
      </div>
    </div>
  );
});

function ChatWindow({
  messages,
  loading,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  const hasMessages = useMemo(
    () => messages.length > 0,
    [messages.length]
  );

  return (
    <section
      className="h-[520px] overflow-y-auto bg-muted/30 p-6"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {!hasMessages && !loading && <EmptyState />}

      {hasMessages && (
        <div className="space-y-5">
          {messages.map((message, index) => (
            <ChatBubble
              key={
                message.id ??
                `${message.role}-${index}-${message.content.slice(
                  0,
                  20
                )}`
              }
              role={message.role}
              message={message.content}
              mode={message.mode}
              sources={message.sources}
            />
          ))}

          {loading && <ThinkingBubble />}

          <div ref={bottomRef} />
        </div>
      )}

      {!hasMessages && loading && (
        <>
          <ThinkingBubble />
          <div ref={bottomRef} />
        </>
      )}
    </section>
  );
}

export default memo(ChatWindow);