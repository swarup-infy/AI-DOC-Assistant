import { useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import { askAI } from "../../services/chatService";
import type {
  ChatMode,
  Source,
} from "../../services/chatService";

import ChatHeader from "../../components/chat/ChatHeader";
import ModeSelector from "../../components/chat/ModeSelector";
import ChatWindow from "../../components/chat/ChatWindow";
import ChatInput from "../../components/chat/ChatInput";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  mode?: ChatMode;
  sources?: Source[];
}

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>("document");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  async function handleAsk() {
    if (!question.trim() || loading) return;

    const currentQuestion = question.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: currentQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await askAI(currentQuestion, mode);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.answer,
          mode,
          sources: response.sources ?? [],
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Unable to get AI response. Please try again.",
          mode,
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ChatHeader mode={mode} />

        <ModeSelector
          mode={mode}
          setMode={setMode}
        />

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <ChatWindow
            messages={messages}
            loading={loading}
          />

          <ChatInput
            question={question}
            setQuestion={setQuestion}
            loading={loading}
            onSend={handleAsk}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
