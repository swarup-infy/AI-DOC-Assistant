import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  FileUp,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";

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

const ACCEPTED_TYPES = ".pdf,.docx,.csv,.xls,.xlsx";
const MAX_FILE_SIZE = 20 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension === "csv" || extension === "xls" || extension === "xlsx"
    ? FileSpreadsheet
    : FileText;
}

export default function DocumentsPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    void loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      setLoadingDocuments(true);
      const response = await getDocuments();
      setDocuments(response);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load your documents.");
      setMessageType("error");
    } finally {
      setLoadingDocuments(false);
    }
  }

  function validateFile(file: File): boolean {
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const accepted = ACCEPTED_TYPES.split(",").includes(extension);

    if (!accepted) {
      setMessage("Please choose a PDF, DOCX, CSV, XLS, or XLSX file.");
      setMessageType("error");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage("File is too large. The maximum size is 20 MB.");
      setMessageType("error");
      return false;
    }

    return true;
  }

  function selectFile(file: File) {
    if (!validateFile(file)) return;

    setSelectedFile(file);
    setMessage("");
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) selectFile(file);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (file) selectFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setMessage("Choose a document first.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const result = await uploadDocument(selectedFile);
      setMessage(result.message || "Document uploaded successfully.");
      setMessageType("success");

      await loadDocuments();
      clearSelectedFile();
    } catch (error) {
      console.error(error);
      setMessage("Upload failed. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  function clearSelectedFile() {
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(id: number) {
    try {
      await deleteDocument(id);
      await loadDocuments();
      setMessage("Document deleted successfully.");
      setMessageType("success");
    } catch (error) {
      console.error(error);
      setMessage("Unable to delete document.");
      setMessageType("error");
    }
  }

  const SelectedIcon = selectedFile ? getFileIcon(selectedFile.name) : FileUp;

  return (
    <DashboardLayout>
      <div className="space-y-8 fade-in">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <FileText size={14} />
              Knowledge base
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Documents
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Upload, organize, and manage the documents your AI assistant uses for search and answers.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-card/60 px-3.5 py-2.5 text-xs text-muted-foreground">
            <CheckCircle2 size={15} className="text-success" />
            {documents.length} {documents.length === 1 ? "document" : "documents"}
          </div>
        </section>

        <section className="surface overflow-hidden rounded-2xl">
          <div className="border-b border-border px-5 py-5 sm:px-6">
            <div>
              <h3 className="text-base font-semibold text-foreground">Add a document</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                PDF, DOCX, CSV, XLS and XLSX up to 20 MB.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              hidden
              onChange={handleFileChange}
            />

            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  inputRef.current?.click();
                }
              }}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragActive(false);
              }}
              onDrop={handleDrop}
              className={`group cursor-pointer rounded-2xl border border-dashed p-7 text-center transition-all sm:p-10 ${
                dragActive
                  ? "border-primary bg-primary/10"
                  : "border-border-strong bg-muted/20 hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                <UploadCloud size={27} />
              </div>
              <h4 className="mt-4 text-sm font-semibold text-foreground sm:text-base">
                Drop your document here or browse
              </h4>
              <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                Securely upload a file to your workspace.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm">
                <FileUp size={15} />
                Choose file
              </span>
            </div>

            {selectedFile && (
              <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <SelectedIcon size={21} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground" title={selectedFile.name}>
                      {selectedFile.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)} · Ready to upload
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    disabled={loading}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-3.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-50"
                  >
                    <X size={16} />
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={loading}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Uploading
                      </>
                    ) : (
                      <>
                        <UploadCloud size={16} />
                        Upload
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {message && (
              <div
                role="status"
                className={`mt-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                  messageType === "success"
                    ? "border-success/20 bg-success/10 text-success"
                    : messageType === "error"
                      ? "border-danger/20 bg-danger/10 text-danger"
                      : "border-border bg-muted text-foreground"
                }`}
              >
                <span className="mt-0.5 shrink-0">
                  {messageType === "success" ? <CheckCircle2 size={17} /> : <FileText size={17} />}
                </span>
                <span>{message}</span>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Your documents</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Files available to your workspace.
              </p>
            </div>
          </div>

          {loadingDocuments ? (
            <div className="surface flex min-h-52 items-center justify-center rounded-2xl">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 size={18} className="animate-spin text-primary" />
                Loading documents...
              </div>
            </div>
          ) : (
            <DocumentTable documents={documents} onDelete={handleDelete} />
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
