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
    <div className="mt-10 overflow-hidden rounded-xl bg-white shadow-lg">

      <table className="min-w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="px-6 py-4 text-left">
              File Name
            </th>

            <th className="px-6 py-4 text-left">
              Type
            </th>

            <th className="px-6 py-4 text-left">
              Size
            </th>

            <th className="px-6 py-4 text-left">
              Uploaded
            </th>

            <th className="px-6 py-4 text-center">
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {documents.length === 0 ? (
            <tr>

              <td
                colSpan={5}
                className="py-8 text-center text-gray-500"
              >
                No documents uploaded.
              </td>

            </tr>
          ) : (
            documents.map((doc) => (
              <tr
                key={doc.id}
                className="border-t"
              >

                <td className="px-6 py-4">
                  {doc.filename}
                </td>

                <td className="px-6 py-4 uppercase">
                  {doc.file_type}
                </td>

                <td className="px-6 py-4">
                  {(doc.file_size / 1024).toFixed(2)} KB
                </td>

                <td className="px-6 py-4">
                  {new Date(
                    doc.uploaded_at
                  ).toLocaleDateString()}
                </td>

                <td className="px-6 py-4 text-center">

                  <button
                    onClick={() =>
                      onDelete(doc.id)
                    }
                    className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>

                </td>

              </tr>
            ))
          )}

        </tbody>

      </table>

    </div>
  );
}