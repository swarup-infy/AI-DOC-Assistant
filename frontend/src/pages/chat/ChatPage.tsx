import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { askAI } from "../../services/chatService";
import type { ChatMode, Source } from "../../services/chatService";
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

    setMessages((previous) => [...previous, { role: "user", content: currentQuestion }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await askAI(currentQuestion, mode);
      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: response.answer, mode, sources: response.sources ?? [] },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: "I couldn't complete that request. Please try again.", mode, sources: [] },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-8 fade-in">
        <ChatHeader mode={mode} />
        <ModeSelector mode={mode} setMode={setMode} />

        <section className="surface overflow-hidden rounded-2xl">
          <ChatWindow messages={messages} loading={loading} />
          <ChatInput question={question} setQuestion={setQuestion} loading={loading} onSend={handleAsk} />
        </section>
      </div>
    </DashboardLayout>
  );
}
