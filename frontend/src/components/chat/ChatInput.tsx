import {
  memo,
  useCallback,
  useRef,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Loader2, SendHorizontal } from "lucide-react";

interface ChatInputProps {
  question: string;
  setQuestion: (value: string) => void;
  loading: boolean;
  onSend: () => void;
}

function ChatInput({
  question,
  setQuestion,
  loading,
  onSend,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = question.trim().length > 0 && !loading;

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      if (!canSend) return;

      onSend();
    },
    [canSend, onSend]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter = Send
      // Shift + Enter = New line

      if (
        e.key === "Enter" &&
        !e.shiftKey &&
        !loading
      ) {
        e.preventDefault();

        if (question.trim()) {
          onSend();
        }
      }
    },
    [loading, question, onSend]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border bg-card p-5"
    >
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          rows={1}
          autoFocus
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your documents..."
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          aria-label="Chat message"
          className="
            min-h-[52px]
            max-h-40
            flex-1
            resize-none
            rounded-xl
            border
            border-border
            bg-background
            px-4
            py-3
            text-sm
            outline-none
            transition
            focus:border-primary
            focus:ring-2
            focus:ring-primary/20
          "
        />

        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="
            flex
            h-[52px]
            items-center
            gap-2
            rounded-xl
            bg-primary
            px-5
            font-medium
            text-primary-foreground
            transition
            hover:opacity-90
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
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
              <SendHorizontal size={18} />
              Send
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default memo(ChatInput);