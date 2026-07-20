import { useState } from "react";

interface BubbleActionsProps {
  message: string;
}

export default function BubbleActions({
  message,
}: BubbleActionsProps) {

  const [copied, setCopied] = useState(false);

  const copyMessage = async () => {
    try {

      await navigator.clipboard.writeText(message);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (error) {
      console.error(error);
    }
  };

  return (

    <div className="mt-3 flex items-center gap-3">

      <button
        onClick={copyMessage}
        className="
          rounded-lg
          border
          border-gray-200
          bg-white
          px-3
          py-1.5
          text-sm
          transition-all
          duration-200
          hover:bg-gray-100
          hover:shadow
        "
      >
        {copied ? "✅ Copied" : "📋 Copy"}
      </button>

      <button
        className="
          rounded-lg
          border
          border-gray-200
          bg-white
          px-3
          py-1.5
          text-sm
          transition-all
          duration-200
          hover:bg-gray-100
        "
      >
        👍 Like
      </button>

      <button
        className="
          rounded-lg
          border
          border-gray-200
          bg-white
          px-3
          py-1.5
          text-sm
          transition-all
          duration-200
          hover:bg-gray-100
        "
      >
        👎 Dislike
      </button>

    </div>

  );
}