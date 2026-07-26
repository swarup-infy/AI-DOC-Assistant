import { KeyboardEvent } from "react";
import { Loader2, SendHorizonal } from "lucide-react";

interface ChatInputProps {
  question: string;
  setQuestion: (value: string) => void;
  loading: boolean;
  onSend: () => void;
}

export default function ChatInput({
  question,
  setQuestion,
  loading,
  onSend,
}: ChatInputProps) {
  function handleKeyDown(
    e: KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="border-t border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your documents..."
          className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        <button
          onClick={onSend}
          disabled={loading || !question.trim()}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />
              Thinking...
            </>
          ) : (
            <>
              <SendHorizonal size={18} />
              Send
            </>
          )}
        </button>
      </div>
    </div>
  );
}