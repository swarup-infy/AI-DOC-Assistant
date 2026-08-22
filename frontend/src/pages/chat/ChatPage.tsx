import { useMemo, useState } from "react";
import { FileCheck2, Lightbulb, Sparkles } from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { askAI, type ChatMode, type Source } from "../../services/chatService";
import { type Document } from "../../services/documentService";
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

const PROMPTS: Record<ChatMode, string[]> = {
  document: [
    "Summarize this document in 5 key points.",
    "Extract the important names, dates, and numbers.",
    "What are the main skills or qualifications mentioned?",
    "Find the most important information in this document.",
  ],
  groq: [
    "Explain this document in simple language.",
    "Turn this document into a concise professional summary.",
    "What questions should I ask after reading this document?",
    "Rewrite the key information as clear bullet points.",
  ],
  smart: [
    "What are the most important facts in this document?",
    "Find anything unusual, missing, or worth reviewing.",
    "Compare the key sections and explain the differences.",
    "Give me the best possible answer using the document.",
  ],
};

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>("document");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [attachedDocument, setAttachedDocument] = useState<Document | null>(null);

  const prompts = useMemo(() => PROMPTS[mode], [mode]);
  const hasStarted = messages.length > 0;

  async function handleAsk() {
    if (!question.trim() || loading) return;

    const currentQuestion = question.trim();
    const currentDocument = attachedDocument;

    setMessages((previous) => [
      ...previous,
      { role: "user", content: currentQuestion },
    ]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await askAI(
        currentQuestion,
        mode,
        currentDocument?.id ?? null
      );

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: response.answer,
          mode,
          sources: response.sources ?? [],
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: "I couldn't complete that request. Please try again.",
          mode,
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handlePrompt(prompt: string) {
    setQuestion(prompt);
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-6xl space-y-4 pb-8 fade-in">
        <ChatHeader mode={mode} />

        <ModeSelector
          mode={mode}
          setMode={setMode}
          showDescriptions={!hasStarted}
        />

        {!hasStarted && (
          <section className="surface rounded-2xl border border-primary/10 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Lightbulb size={18} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground">Try a ready-made prompt</h2>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {mode === "document" ? "Document AI" : mode === "groq" ? "Groq AI" : "Smart AI"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Upload a file below, then choose a prompt or write your own question.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handlePrompt(prompt)}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-left text-xs font-medium text-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </section>
        )}

        {attachedDocument && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-muted-foreground">
            <FileCheck2 size={15} className="text-emerald-500" />
            <span className="font-medium text-foreground">{attachedDocument.filename}</span>
            <span>is attached to this chat and available to all three AI modes.</span>
            <Sparkles size={14} className="ml-auto shrink-0 text-primary" />
          </div>
        )}

        <section className="surface overflow-hidden rounded-2xl">
          <ChatWindow messages={messages} loading={loading} />
          <ChatInput
            question={question}
            setQuestion={setQuestion}
            loading={loading}
            onSend={handleAsk}
            attachedDocument={attachedDocument}
            onDocumentAttached={setAttachedDocument}
            onDocumentRemoved={() => setAttachedDocument(null)}
          />
        </section>
      </div>
    </DashboardLayout>
  );
}
