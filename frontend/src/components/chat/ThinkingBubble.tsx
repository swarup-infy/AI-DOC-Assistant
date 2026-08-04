import { Bot } from "lucide-react";

export default function ThinkingBubble() {
  return (
    <div className="mb-6 flex justify-start">
      <div className="w-full max-w-[90%]">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <Bot
              size={18}
              className="text-primary"
            />
          </div>

          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            AI Assistant
          </span>
        </div>

        <div className="rounded-2xl rounded-tl-md border border-border bg-card px-5 py-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />

            <span
              className="h-2 w-2 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: "0.15s" }}
            />

            <span
              className="h-2 w-2 animate-bounce rounded-full bg-primary"
              style={{ animationDelay: "0.3s" }}
            />

            <span className="ml-2 text-sm text-muted-foreground">
              AI is thinking...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
