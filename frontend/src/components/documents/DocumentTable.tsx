import { memo, useCallback } from "react";
import { FileSpreadsheet, FileText, Trash2 } from "lucide-react";

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
    unit += 1;
  }

  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unit]}`;
}

function formatDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsed);
}

function getFileIcon(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension === "csv" || extension === "xls" || extension === "xlsx"
    ? FileSpreadsheet
    : FileText;
}

function DocumentTable({ documents, onDelete }: DocumentTableProps) {
  const handleDelete = useCallback(
    (id: number, filename: string) => {
      const confirmed = window.confirm(`Delete “${filename}” permanently?`);
      if (confirmed) onDelete(id);
    },
    [onDelete]
  );

  if (documents.length === 0) {
    return (
      <section className="surface rounded-2xl p-8 sm:p-12">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileText size={25} />
          </div>
          <h4 className="mt-4 text-base font-semibold text-foreground">
            Your knowledge base is empty
          </h4>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Upload your first document above and it will appear here, ready for AI-powered search and chat.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="surface overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="border-b border-border bg-muted/45">
            <tr>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:px-6">
                Document
              </th>
              <th className="hidden px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:table-cell">
                Type
              </th>
              <th className="hidden px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:table-cell">
                Size
              </th>
              <th className="hidden px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:table-cell">
                Uploaded
              </th>
              <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:px-6">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {documents.map((doc) => {
              const FileIcon = getFileIcon(doc.filename);

              return (
                <tr key={doc.id} className="group transition-colors hover:bg-muted/30">
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex min-w-[220px] items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/8 text-primary">
                        <FileIcon size={19} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className="max-w-[320px] truncate text-sm font-semibold text-foreground"
                          title={doc.filename}
                        >
                          {doc.filename}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground sm:hidden">
                          {formatFileSize(doc.file_size)} · {formatDate(doc.uploaded_at)}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="hidden px-5 py-4 sm:table-cell">
                    <span className="inline-flex rounded-md border border-border bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {doc.file_type || "file"}
                    </span>
                  </td>

                  <td className="hidden px-5 py-4 text-sm text-muted-foreground md:table-cell">
                    {formatFileSize(doc.file_size)}
                  </td>

                  <td className="hidden px-5 py-4 text-sm text-muted-foreground lg:table-cell">
                    <time dateTime={doc.uploaded_at}>{formatDate(doc.uploaded_at)}</time>
                  </td>

                  <td className="px-5 py-4 text-right sm:px-6">
                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id, doc.filename)}
                      aria-label={`Delete ${doc.filename}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-destructive/30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default memo(DocumentTable);
