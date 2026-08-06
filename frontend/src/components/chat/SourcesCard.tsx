import { memo } from "react";
import { FileText } from "lucide-react";

import type { Source } from "../../services/chatService";

interface SourcesCardProps {
  sources: ReadonlyArray<Source>;
}

function SourcesCard({
  sources,
}: SourcesCardProps) {
  if (!sources.length) return null;

  return (
    <section
      className="mt-5"
      aria-labelledby="sources-heading"
    >
      <header className="mb-3 flex items-center gap-2">
        <FileText
          size={18}
          className="text-primary"
          aria-hidden="true"
        />

        <h3
          id="sources-heading"
          className="text-sm font-semibold text-foreground"
        >
          Sources
        </h3>
      </header>

      <ul className="space-y-3">
        {sources.map((source) => {
          const key = `${source.document_name}-${source.page}`;

          return (
            <li key={key}>
              <article
                className="
                  rounded-xl
                  border
                  border-border
                  bg-card
                  p-4
                  transition-colors
                  hover:border-primary/40
                  hover:bg-muted
                "
              >
                <p className="truncate font-medium text-foreground">
                  {source.document_name}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Page {source.page}
                </p>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default memo(SourcesCard);