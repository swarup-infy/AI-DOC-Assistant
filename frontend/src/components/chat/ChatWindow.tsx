import { useEffect, useRef } from "react";

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

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  return (
    <div className="h-[520px] overflow-y-auto bg-gray-50 p-6">

      {messages.length === 0 && !loading && (
        <div className="flex h-full items-center justify-center">

          <div className="text-center">

            <div className="text-6xl">
              👾
            </div>

            <h2 className="mt-4 text-2xl font-semibold">
              AI Document Assistant
            </h2>

            <p className="mt-2 text-gray-500">
              Start a conversation by asking a question.
            </p>

          </div>

        </div>
      )}

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
  );
}