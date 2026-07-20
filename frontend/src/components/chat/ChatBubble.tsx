import type {
  ChatMode,
  Source,
} from "../../services/chatService";

import BubbleActions from "./BubbleActions";
import BubbleContent from "./BubbleContent";
import BubbleHeader from "./BubbleHeader";
import SourcesCard from "./SourcesCard";

interface ChatBubbleProps {
  role: "user" | "assistant";
  message: string;
  mode?: ChatMode;
  sources?: Source[];
}

export default function ChatBubble({
  role,
  message,
  mode,
  sources = [],
}: ChatBubbleProps) {

  const getModeLabel = () => {
    switch (mode) {
      case "document":
        return "📄 Documents";

      case "gemini":
        return "✨ AI Assistant";

      case "smart":
        return "🤖 Smart AI";

      default:
        return "🤖 AI";
    }
  };

  // =====================================================
  // USER MESSAGE
  // =====================================================

  if (role === "user") {

    return (
      <div className="mb-8 flex justify-end">

        <div className="max-w-[80%]">

          <div className="mb-2 flex justify-end">

            <span className="rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white shadow">
              👤 You
            </span>

          </div>

          <div className="whitespace-pre-wrap rounded-3xl rounded-tr-md bg-blue-600 px-6 py-4 leading-7 text-white shadow-lg">
            {message}
          </div>

        </div>

      </div>
    );

  }

  // =====================================================
  // AI MESSAGE
  // =====================================================

  return (

    <div className="mb-8 flex justify-start">

      <div className="w-full max-w-[90%]">

        <BubbleHeader
          title={getModeLabel()}
          copied={false}
          onCopy={() => {}}
        />

        <BubbleContent
          message={message}
        />

        <SourcesCard
          sources={sources}
        />

        <BubbleActions
          message={message}
        />

      </div>

    </div>

  );

}