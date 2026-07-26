import { FileText } from "lucide-react";

import type { Source } from "../../services/chatService";

interface SourcesCardProps {
  sources: Source[];
}

export default function SourcesCard({
  sources,
}: SourcesCardProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center gap-2">
        <FileText
          size={18}
          className="text-primary"
        />

        <h3 className="text-sm font-semibold text-foreground">
          Sources
        </h3>
      </div>

      <div className="space-y-3">
        {sources.map((source, index) => (
          <div
            key={`${source.document_name}-${source.page}-${index}`}
            className="rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:bg-muted"
          >
            <p className="font-medium text-foreground">
              {source.document_name}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Page {source.page}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}