import { memo, useCallback } from "react";
import { FileText, Trash2 } from "lucide-react";

interface Document {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

interface DocumentTableProps {
  documents: ReadonlyArray<Document>;
  onDelete: (id: number) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }

  return `${size.toFixed(2)} ${units[unit]}`;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function DocumentTable({
  documents,
  onDelete,
}: DocumentTableProps) {
  const handleDelete = useCallback(
    (id: number) => {
      const confirmed = window.confirm(
        "Delete this document permanently?"
      );

      if (!confirmed) return;

      onDelete(id);
    },
    [onDelete]
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-border bg-muted">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Document
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Type
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Size
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Uploaded
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-16 text-center text-muted-foreground"
                >
                  No documents uploaded yet.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-border transition-colors hover:bg-muted/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <FileText
                          size={18}
                          className="text-primary"
                          aria-hidden="true"
                        />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="truncate font-medium text-foreground"
                          title={doc.filename}
                        >
                          {doc.filename}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 uppercase text-muted-foreground">
                    {doc.file_type}
                  </td>

                  <td className="px-6 py-4 text-muted-foreground">
                    {formatFileSize(doc.file_size)}
                  </td>

                  <td className="px-6 py-4 text-muted-foreground">
                    <time dateTime={doc.uploaded_at}>
                      {formatDate(doc.uploaded_at)}
                    </time>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id)}
                      aria-label={`Delete ${doc.filename}`}
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-lg
                        border
                        border-red-500
                        px-3
                        py-2
                        text-red-500
                        transition-colors
                        hover:bg-red-500
                        hover:text-white
                        focus:outline-none
                        focus:ring-2
                        focus:ring-red-500
                        focus:ring-offset-2
                      "
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default memo(DocumentTable);