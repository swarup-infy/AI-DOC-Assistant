import { memo } from "react";
import { Bot } from "lucide-react";

const DOT_DELAYS = [
  "0ms",
  "150ms",
  "300ms",
] as const;

function ThinkingBubble() {
  return (
    <section
      className="mb-6 flex justify-start"
      role="status"
      aria-live="polite"
      aria-label="AI is generating a response"
    >
      <div className="w-full max-w-[90%]">
        <header className="mb-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <Bot
              size={18}
              className="text-primary"
              aria-hidden="true"
            />
          </div>

          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            AI Assistant
          </span>
        </header>

        <article className="rounded-2xl rounded-tl-md border border-border bg-card px-5 py-4 shadow-sm">
          <div className="flex items-center gap-2">
            {DOT_DELAYS.map((delay) => (
              <span
                key={delay}
                aria-hidden="true"
                className="h-2 w-2 animate-bounce rounded-full bg-primary"
                style={{
                  animationDelay: delay,
                }}
              />
            ))}

            <span className="ml-2 text-sm text-muted-foreground">
              AI is thinking...
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}

export default memo(ThinkingBubble);