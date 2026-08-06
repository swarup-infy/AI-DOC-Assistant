import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

interface BubbleActionsProps {
  message: string;
  onLike?: () => void;
  onDislike?: () => void;
}

export default function BubbleActions({
  message,
  onLike,
  onDislike,
}: BubbleActionsProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copyMessage = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message);

      setCopied(true);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  }, [message]);

  const buttonClass =
    "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div
      className="mt-4 flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Message actions"
    >
      <button
        type="button"
        onClick={copyMessage}
        className={buttonClass}
        aria-label="Copy message"
        title="Copy message"
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
        type="button"
        onClick={onLike}
        className={buttonClass}
        aria-label="Like response"
        title="Like response"
      >
        <ThumbsUp size={16} />
        Like
      </button>

      <button
        type="button"
        onClick={onDislike}
        className={buttonClass}
        aria-label="Dislike response"
        title="Dislike response"
      >
        <ThumbsDown size={16} />
        Dislike
      </button>
    </div>
  );
}