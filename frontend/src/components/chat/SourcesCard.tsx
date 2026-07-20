import type { Source } from "../../services/chatService";

interface SourcesCardProps {
  sources: Source[];
}

export default function SourcesCard({
  sources,
}: SourcesCardProps) {

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-5">

      <div className="mb-3 flex items-center gap-2">

        <span className="text-lg">📄</span>

        <h3 className="text-sm font-semibold text-gray-700">
          Sources
        </h3>

      </div>

      <div className="space-y-3">

        {sources.map((source, index) => (

          <div
            key={`${source.document_name}-${source.page}-${index}`}
            className="
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              p-4
              transition-all
              hover:border-blue-300
              hover:bg-blue-50
            "
          >

            <div className="font-medium text-slate-900">
              📘 {source.document_name}
            </div>

            <div className="mt-1 text-sm text-gray-600">
              Page {source.page}
            </div>

          </div>

        ))}

      </div>

    </div>
  );
}