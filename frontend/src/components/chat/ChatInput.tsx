import { KeyboardEvent } from "react";

interface ChatInputProps {
  question: string;
  setQuestion: (value: string) => void;
  loading: boolean;
  onSend: () => void;
}

export default function ChatInput({
  question,
  setQuestion,
  loading,
  onSend,
}: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      onSend();
    }
  };

  return (
    <div className="border-t bg-white p-5">

      <div className="flex gap-4">

        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <button
          onClick={onSend}
          disabled={loading || !question.trim()}
          className="rounded-xl bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Send"}
        </button>

      </div>

    </div>
  );
}