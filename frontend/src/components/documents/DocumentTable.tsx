import {
  FileText,
  Trash2,
} from "lucide-react";

interface Document {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

interface Props {
  documents: Document[];
  onDelete: (id: number) => void;
}

export default function DocumentTable({
  documents,
  onDelete,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
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
                  className="py-12 text-center text-muted-foreground"
                >
                  No documents uploaded.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-border transition hover:bg-muted/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <FileText
                          size={18}
                          className="text-primary"
                        />
                      </div>

                      <div>
                        <p className="font-medium text-foreground">
                          {doc.filename}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 uppercase text-muted-foreground">
                    {doc.file_type}
                  </td>

                  <td className="px-6 py-4 text-muted-foreground">
                    {(doc.file_size / 1024).toFixed(2)} KB
                  </td>

                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(
                      doc.uploaded_at
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-500 px-3 py-2 text-red-500 transition hover:bg-red-500 hover:text-white"
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
    </div>
  );
}