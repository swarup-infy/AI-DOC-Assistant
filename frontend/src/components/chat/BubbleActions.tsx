import { useState } from "react";
import {
  Check,
  Copy,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

interface BubbleActionsProps {
  message: string;
}

export default function BubbleActions({
  message,
}: BubbleActionsProps) {
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        onClick={copyMessage}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition hover:bg-accent"
      >
        {copied ? (
          <>
            <Check size={16} />
            Copied
          </>
        ) : (
          <>
            <Copy size={16} />
            Copy
          </>
        )}
      </button>

      <button
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition hover:bg-accent"
      >
        <ThumbsUp size={16} />
        Like
      </button>

      <button
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition hover:bg-accent"
      >
        <ThumbsDown size={16} />
        Dislike
      </button>
    </div>
  );
}