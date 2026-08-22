import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  Clock3,
  FileText,
  HardDrive,
  MessageSquare,
  Search,
  Sparkles,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";
import { getDocuments, type Document } from "../../services/documentService";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function relativeTime(value: string): string {
  const date = new Date(value).getTime();
  if (Number.isNaN(date)) return "Recently";
  const minutes = Math.max(0, Math.floor((Date.now() - date) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDocuments() {
    try {
      setLoading(true);
      setError("");
      setDocuments(await getDocuments());
    } catch (err) {
      console.error(err);
      setError("We couldn't load your documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDocuments();
  }, []);

  const stats = useMemo(() => {
    const storage = documents.reduce((total, document) => total + document.file_size, 0);
    return [
      { label: "Documents", value: documents.length.toString(), icon: FileText },
      { label: "AI Chats", value: "—", icon: MessageSquare },
      { label: "Semantic Searches", value: "—", icon: Search },
      { label: "Storage", value: formatSize(storage), icon: HardDrive },
    ];
  }, [documents]);

  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <DashboardLayout>
      <div className="space-y-7 pb-10 fade-in">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                <Sparkles size={14} />
                AI-powered workspace
              </div>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {greeting}, {firstName}.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Your documents, semantic search, and AI conversations — organized in one focused workspace.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button type="button" onClick={() => navigate("/documents")} className="group inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:-translate-y-0.5 hover:opacity-95">
                  <UploadCloud size={17} /> Upload document <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
                <button type="button" onClick={() => navigate("/chat")} className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background/60 px-4 text-sm font-semibold text-foreground transition hover:bg-accent">
                  <Bot size={17} className="text-primary" /> Open AI chat
                </button>
              </div>
            </div>
            <div className="hidden w-64 shrink-0 rounded-2xl border border-border bg-background/55 p-5 backdrop-blur-xl lg:block">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">System status</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" />Ready</span>
              </div>
              <div className="mt-5 h-px bg-border" />
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles size={19} /></div>
                <div><p className="text-sm font-semibold text-foreground">Groq AI</p><p className="text-xs text-muted-foreground">Assistant engine connected</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <article key={label} className="surface surface-hover rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3"><span className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</span><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon size={17} /></span></div>
              <p className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
          <article className="surface overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-6">
              <div><h3 className="text-base font-semibold text-foreground">Recent documents</h3><p className="mt-1 text-xs text-muted-foreground sm:text-sm">Your latest files and their processing status.</p></div>
              <button type="button" onClick={() => navigate("/documents")} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground">View all</button>
            </div>
            <div className="p-4 sm:p-5">
              {loading ? (
                <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-muted" />)}</div>
              ) : error ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-5 text-sm text-destructive"><p>{error}</p><button type="button" onClick={() => void loadDocuments()} className="mt-3 font-semibold underline">Try again</button></div>
              ) : documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FileText size={22} /></div>
                  <h4 className="mt-4 text-sm font-semibold text-foreground">No documents yet</h4>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground sm:text-sm">Upload your first document and start building your AI knowledge base.</p>
                  <button type="button" onClick={() => navigate("/documents")} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground"><UploadCloud size={15} />Upload document</button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {documents.slice(0, 5).map((document) => (
                    <div key={document.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileText size={18} /></div>
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground" title={document.filename}>{document.filename}</p><p className="mt-0.5 text-xs text-muted-foreground">{document.file_type?.toUpperCase() || "FILE"} · {formatSize(document.file_size)}</p></div>
                      <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex"><Clock3 size={13} />{relativeTime(document.uploaded_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </article>

          <article className="surface rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles size={19} /></div><div><h3 className="text-base font-semibold text-foreground">Quick actions</h3><p className="text-xs text-muted-foreground">Jump straight into your workflow.</p></div></div>
            <div className="mt-5 space-y-2">
              <QuickAction icon={UploadCloud} title="Upload document" description="Add a new source" onClick={() => navigate("/documents")} />
              <QuickAction icon={Search} title="Semantic search" description="Find knowledge fast" onClick={() => navigate("/search")} />
              <QuickAction icon={MessageSquare} title="AI chat" description="Ask your assistant" onClick={() => navigate("/chat")} />
            </div>
          </article>
        </section>
      </div>
    </DashboardLayout>
  );
}

function QuickAction({ icon: Icon, title, description, onClick }: { icon: LucideIcon; title: string; description: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="group flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-left transition hover:border-border hover:bg-muted/50"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon size={17} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-foreground">{title}</span><span className="block text-xs text-muted-foreground">{description}</span></span><ArrowRight size={15} className="text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" /></button>;
}
