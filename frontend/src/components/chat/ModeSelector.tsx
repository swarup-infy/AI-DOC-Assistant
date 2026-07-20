import type { ChatMode } from "../../services/chatService";

interface ModeSelectorProps {
  mode: ChatMode;
  setMode: (mode: ChatMode) => void;
}

export default function ModeSelector({
  mode,
  setMode,
}: ModeSelectorProps) {
  const modes = [
    {
      id: "document",
      icon: "📄",
      title: "Documents",
      description: "Answer only from your uploaded files.",
      activeColor: "border-blue-600 bg-blue-50",
      hoverColor: "hover:border-blue-300",
    },
    {
      id: "gemini",
      icon: "✨",
      title: "AI Assistant",
      description: "Ask anything using Gemini AI.",
      activeColor: "border-purple-600 bg-purple-50",
      hoverColor: "hover:border-purple-300",
    },
    {
      id: "smart",
      icon: "🤖",
      title: "Smart AI",
      description: "Uses documents first, then Gemini if needed.",
      activeColor: "border-green-600 bg-green-50",
      hoverColor: "hover:border-green-300",
    },
  ];

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <h2 className="text-xl font-semibold">
        Choose AI Mode
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Select how you want the AI to answer your questions.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-3">

        {modes.map((item) => (
          <button
            key={item.id}
            onClick={() => setMode(item.id as ChatMode)}
            className={`rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
              mode === item.id
                ? `${item.activeColor} shadow-lg`
                : `border-gray-200 ${item.hoverColor} hover:shadow-md`
            }`}
          >
            <div className="text-5xl">
              {item.icon}
            </div>

            <h3 className="mt-4 text-xl font-bold">
              {item.title}
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              {item.description}
            </p>
          </button>
        ))}

      </div>

    </div>
  );
}