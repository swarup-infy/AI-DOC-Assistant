import {
  memo,
  useEffect,
  useRef,
  useState,
} from "react";

interface TypingTextProps {
  text: string;
  speed?: number;
  enabled?: boolean;
}

function TypingText({
  text,
  speed = 15,
  enabled = true,
}: TypingTextProps) {
  const [displayText, setDisplayText] = useState(
    enabled ? "" : text
  );

  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!enabled) {
      setDisplayText(text);
      return;
    }

    if (!text) {
      setDisplayText("");
      return;
    }

    let cancelled = false;
    let index = 0;

    setDisplayText("");

    const type = () => {
      if (cancelled) return;

      index += 1;
      setDisplayText(text.slice(0, index));

      if (index < text.length) {
        timeoutRef.current = window.setTimeout(type, speed);
      }
    };

    timeoutRef.current = window.setTimeout(type, speed);

    return () => {
      cancelled = true;

      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, enabled]);

  return (
    <span aria-live="polite" aria-atomic="true">
      {displayText}
    </span>
  );
}

export default memo(TypingText);
