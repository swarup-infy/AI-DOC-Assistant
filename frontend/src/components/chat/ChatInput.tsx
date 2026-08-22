import { memo, useCallback, useRef, type FormEvent, type KeyboardEvent } from "react";
import { Loader2, SendHorizontal } from "lucide-react";

interface ChatInputProps {
  question: string;
  setQuestion: (value: string) => void;
  loading: boolean;
  onSend: () => void;
}

function ChatInput({ question, setQuestion, loading, onSend }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = question.trim().length > 0 && !loading;

  const handleSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();
    if (canSend) onSend();
  }, [canSend, onSend]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !loading) {
      event.preventDefault();
      if (question.trim()) onSend();
    }
  }, [loading, onSend, question]);

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-card p-4 sm:p-5">
      <div className="rounded-2xl border border-border bg-background/70 p-2 shadow-sm transition focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={2}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents..."
            spellCheck={false}
            autoComplete="off"
            aria-label="Chat message"
            className="max-h-40 min-h-[58px] flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
          />

          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {loading ? <Loader2 size={17} className="animate-spin" /> : <SendHorizontal size={17} />}
            <span className="hidden sm:inline">{loading ? "Thinking" : "Send"}</span>
          </button>
        </div>
        <div className="flex items-center justify-between px-3 pb-1 pt-1 text-[11px] text-muted-foreground">
          <span>Enter to send · Shift + Enter for a new line</span>
          <span>{question.length}/4,000</span>
        </div>
      </div>
    </form>
  );
}

export default memo(ChatInput);
