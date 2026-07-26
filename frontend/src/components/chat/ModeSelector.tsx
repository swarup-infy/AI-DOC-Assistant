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
      activeClass:
        "border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400",
      hoverClass: "hover:border-blue-400",
    },
    {
      id: "gemini",
      icon: "✨",
      title: "AI Assistant",
      description: "Ask anything using AI.",
      activeClass:
        "border-purple-600 bg-purple-500/10 text-purple-600 dark:text-purple-400",
      hoverClass: "hover:border-purple-400",
    },
    {
      id: "smart",
      icon: "🤖",
      title: "Smart AI",
      description: "Uses documents first, then AI if needed.",
      activeClass:
        "border-green-600 bg-green-500/10 text-green-600 dark:text-green-400",
      hoverClass: "hover:border-green-400",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors">
      <h2 className="text-xl font-semibold text-card-foreground">
        Choose AI Mode
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Select how you want the AI to answer your questions.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {modes.map((item) => {
          const active = mode === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setMode(item.id as ChatMode)}
              className={`rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                active
                  ? `${item.activeClass} shadow-lg`
                  : `border-border bg-card hover:bg-accent hover:shadow-md ${item.hoverClass}`
              }`}
            >
              <div className="text-5xl">{item.icon}</div>

              <h3 className="mt-4 text-xl font-bold text-card-foreground">
                {item.title}
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}