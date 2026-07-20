import type { ChatMode } from "../../services/chatService";

interface ChatHeaderProps {
  mode: ChatMode;
}

export default function ChatHeader({ mode }: ChatHeaderProps) {
  const modeInfo = {
    document: {
      icon: "📄",
      title: "Documents",
      description: "Answering only from your uploaded documents.",
      badgeColor: "bg-blue-100 text-blue-700",
    },
    gemini: {
      icon: "✨",
      title: "AI Assistant",
      description: "Using Gemini for general AI conversations.",
      badgeColor: "bg-purple-100 text-purple-700",
    },
    smart: {
      icon: "🤖",
      title: "Smart AI",
      description: "Searching documents first, then using Gemini if needed.",
      badgeColor: "bg-green-100 text-green-700",
    },
  };

  const current = modeInfo[mode];

  return (
    <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-gray-900">
            AI Document Assistant
          </h1>

          <p className="mt-2 text-gray-500">
            Chat with your uploaded documents or use AI for general questions.
          </p>

        </div>

        <div
          className={`rounded-full px-4 py-2 text-sm font-semibold ${current.badgeColor}`}
        >
          {current.icon} {current.title}
        </div>

      </div>

      <div className="mt-4 rounded-xl bg-gray-50 p-4">

        <p className="text-sm text-gray-600">
          {current.description}
        </p>

      </div>

    </div>
  );
}