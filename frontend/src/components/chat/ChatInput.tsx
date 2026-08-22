import { memo, useCallback, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Paperclip,
  SendHorizontal,
  X,
} from "lucide-react";
import { uploadDocument, type Document } from "../../services/documentService";

interface ChatInputProps {
  question: string;
  setQuestion: (value: string) => void;
  loading: boolean;
  onSend: () => void;
  attachedDocument: Document | null;
  onDocumentAttached: (document: Document) => void;
  onDocumentRemoved: () => void;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ["pdf", "docx", "txt", "csv", "xls", "xlsx"];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ChatInput({
  question,
  setQuestion,
  loading,
  onSend,
  attachedDocument,
  onDocumentAttached,
  onDocumentRemoved,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const canSend = question.trim().length > 0 && !loading && !uploading;

  const handleSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();
    if (canSend) onSend();
  }, [canSend, onSend]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !loading && !uploading) {
      event.preventDefault();
      if (question.trim()) onSend();
    }
  }, [loading, onSend, question, uploading]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setUploadError("Supported files: PDF, DOCX, TXT, CSV, XLS and XLSX.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("The maximum file size is 20 MB.");
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      const response = await uploadDocument(file);
      onDocumentAttached(response.document);
    } catch (error) {
      console.error("Chat upload failed", error);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [onDocumentAttached]);

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-card/95 p-3 sm:p-4">
      <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-background shadow-sm transition focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
        {attachedDocument && (
          <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText size={16} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{attachedDocument.filename}</p>
                <p className="text-[11px] text-muted-foreground">{formatBytes(attachedDocument.file_size)} · Ready for all AI modes</p>
              </div>
              <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
            </div>
            <button
              type="button"
              onClick={onDocumentRemoved}
              disabled={loading}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
              aria-label="Remove attached document from chat"
              title="Remove from chat"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 p-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.csv,.xls,.xlsx"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || uploading}
            aria-label="Upload a document"
            title="Upload document"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
          </button>

          <textarea
            ref={textareaRef}
            rows={2}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={attachedDocument ? `Ask anything about ${attachedDocument.filename}...` : "Ask anything, or attach a document..."}
            spellCheck
            autoComplete="off"
            aria-label="Chat message"
            className="max-h-40 min-h-[58px] flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
          />

          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {loading ? <Loader2 size={17} className="animate-spin" /> : <SendHorizontal size={17} />}
            <span className="hidden sm:inline">{loading ? "Thinking" : "Send"}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-2 text-[11px] text-muted-foreground">
          <span>Attach a file to use it with Documents, Groq AI and Smart AI.</span>
          <span>{question.length}/5,000</span>
        </div>
      </div>

      {uploadError && (
        <p className="mx-auto mt-2 max-w-4xl text-xs font-medium text-destructive" role="alert">
          {uploadError}
        </p>
      )}
    </form>
  );
}

export default memo(ChatInput);
