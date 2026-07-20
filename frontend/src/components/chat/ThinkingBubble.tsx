export default function ThinkingBubble() {
  return (
    <div className="mb-6 flex justify-start">

      <div className="max-w-[75%]">

        <div className="mb-2">

          <span className="rounded-full bg-gray-900 px-3 py-1 text-sm font-medium text-white">
            🤖 AI Assistant
          </span>

        </div>

        <div className="rounded-2xl rounded-tl-md border bg-gray-50 px-5 py-4 shadow-sm">

          <div className="flex items-center gap-2">

            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500"></div>

            <div
              className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
              style={{ animationDelay: "0.2s" }}
            ></div>

            <div
              className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
              style={{ animationDelay: "0.4s" }}
            ></div>

            <span className="ml-2 text-gray-500">
              Thinking...
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}