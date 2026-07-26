import { useEffect, useRef, useState } from "react";
import { FileUp, Upload, Loader2 } from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import DocumentTable from "../../components/documents/DocumentTable";

import {
  uploadDocument,
  getDocuments,
  deleteDocument,
} from "../../services/documentService";

interface Document {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export default function DocumentsPage() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const response = await getDocuments();
      setDocuments(response.documents ?? response);
    } catch (error) {
      console.error(error);
    }
  }

  function chooseFile() {
    inputRef.current?.click();
  }

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (e.target.files?.length) {
      setSelectedFile(e.target.files[0]);
      setMessage("");
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setMessage("Please select a file.");
      return;
    }

    try {
      setLoading(true);

      const result = await uploadDocument(selectedFile);

      setMessage(result.message);

      await loadDocuments();

      setSelectedFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      setMessage("Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteDocument(id);

      await loadDocuments();

      setMessage("Document deleted successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Unable to delete document.");
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Documents
          </h1>

          <p className="mt-2 text-muted-foreground">
            Upload and manage your PDF, DOCX, CSV and Excel files.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <input
            ref={inputRef}
            type="file"
            hidden
            onChange={handleFileChange}
          />

          <div className="flex flex-col gap-6">
            <button
              onClick={chooseFile}
              className="flex w-fit items-center gap-2 rounded-xl border border-border px-5 py-3 transition hover:bg-accent"
            >
              <FileUp size={20} />
              Choose File
            </button>

            {selectedFile && (
              <div className="rounded-xl border border-border bg-muted p-4">
                <p className="font-medium text-foreground">
                  {selectedFile.name}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={loading}
              className="flex w-fit items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Document
                </>
              )}
            </button>

            {message && (
              <div className="rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground">
                {message}
              </div>
            )}
          </div>
        </div>

        <DocumentTable
          documents={documents}
          onDelete={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
}