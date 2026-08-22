import { memo, useLayoutEffect, useRef } from "react";
import { Bot, MessageCircle } from "lucide-react";

import type { ChatMode, Source } from "../../services/chatService";
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
    <div className="flex min-h-[430px] items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Bot size={27} />
        </div>
        <h2 className="mt-5 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Start a conversation
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Ask about an uploaded document, request a summary, or switch to Groq AI for a general question.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5"><MessageCircle size={13} /> Ask questions</span>
          <span className="rounded-full border border-border bg-card px-3 py-1.5">Summarize</span>
          <span className="rounded-full border border-border bg-card px-3 py-1.5">Find sources</span>
        </div>
      </div>
    </div>
  );
});

function ChatWindow({ messages, loading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  return (
    <section
      className="h-[min(58vh,560px)] min-h-[430px] overflow-y-auto bg-background/35 px-4 py-5 sm:px-6"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {messages.length === 0 && !loading ? <EmptyState /> : null}

      {messages.length > 0 ? (
        <div className="mx-auto max-w-4xl space-y-5">
          {messages.map((message, index) => (
            <ChatBubble
              key={message.id ?? `${message.role}-${index}-${message.content.slice(0, 20)}`}
              role={message.role}
              message={message.content}
              mode={message.mode}
              sources={message.sources}
            />
          ))}
          {loading ? <ThinkingBubble /> : null}
          <div ref={bottomRef} />
        </div>
      ) : loading ? (
        <div className="mx-auto max-w-4xl"><ThinkingBubble /><div ref={bottomRef} /></div>
      ) : null}
    </section>
  );
}

export default memo(ChatWindow);
