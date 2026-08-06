import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  FileText,
  HardDrive,
  MessageSquare,
  Search,
  Sparkles,
  Upload,
  type LucideIcon,
} from "lucide-react";

/* ============================================================
   TYPES
   ============================================================ */

type Accent = "blue" | "violet" | "amber" | "emerald";

interface StatItem {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent: Accent;
  delta?: string; // e.g. "+3 this week" — optional trend line
}

interface RecentDocument {
  id: string;
  name: string;
  type: string;
  sizeLabel: string;
  updatedAt: string; // ISO string
}

interface QuickAction {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onClick: () => void;
  accent: Accent;
}

/* ============================================================
   STYLE TOKENS
   ============================================================ */

const ACCENT_STYLES: Record<Accent, { icon: string; ring: string; dot: string }> = {
  blue: { icon: "text-blue-400 bg-blue-500/10", ring: "ring-blue-500/20", dot: "bg-blue-400" },
  violet: { icon: "text-violet-400 bg-violet-500/10", ring: "ring-violet-500/20", dot: "bg-violet-400" },
  amber: { icon: "text-amber-400 bg-amber-500/10", ring: "ring-amber-500/20", dot: "bg-amber-400" },
  emerald: { icon: "text-emerald-400 bg-emerald-500/10", ring: "ring-emerald-500/20", dot: "bg-emerald-400" },
};

/* ============================================================
   HELPERS
   ============================================================ */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ============================================================
   SKELETON PRIMITIVES
   ============================================================ */

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-border/60 ${className}`}
      aria-hidden="true"
    />
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface px-6 py-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-8 w-14" />
    </div>
  );
}

function DocumentRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-background/40 p-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-3 w-12 shrink-0" />
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName = user?.name?.split(" ")[0] ?? "there";

  // Simulated fetch — swap with real query (react-query/swr) in production
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<RecentDocument[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      if (cancelled) return;
      // Replace this block with your real API call.
      setDocuments([]);
      setIsLoading(false);
    }, 700);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const stats: StatItem[] = useMemo(
    () => [
      { title: "Documents", value: documents.length, icon: FileText, accent: "blue" },
      { title: "AI Chats", value: 0, icon: MessageSquare, accent: "violet" },
      { title: "Searches", value: 0, icon: Search, accent: "amber" },
      { title: "Storage", value: "0 MB", icon: HardDrive, accent: "emerald" },
    ],
    [documents.length]
  );

  const quickActions: QuickAction[] = [
    {
      title: "Upload Document",
      subtitle: "Add PDFs, DOCX & more",
      icon: Upload,
      onClick: () => navigate("/documents"),
      accent: "blue",
    },
    {
      title: "Semantic Search",
      subtitle: "Find information instantly",
      icon: Search,
      onClick: () => navigate("/search"),
      accent: "amber",
    },
    {
      title: "AI Chat",
      subtitle: "Talk with your documents",
      icon: Sparkles,
      onClick: () => navigate("/chat"),
      accent: "violet",
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 pb-12">
        <HeroSection
          greeting={getGreeting()}
          firstName={firstName}
          onUpload={() => navigate("/documents")}
          onChat={() => navigate("/chat")}
        />

        <StatsSection stats={stats} isLoading={isLoading} />

        <section className="grid gap-6 xl:grid-cols-3">
          <RecentDocumentsPanel
            documents={documents}
            isLoading={isLoading}
            error={error}
            onRetry={() => {
              setError(null);
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 600);
            }}
            onUpload={() => navigate("/documents")}
            onViewAll={() => navigate("/documents")}
          />

          <QuickActionsPanel actions={quickActions} />
        </section>
      </div>
    </DashboardLayout>
  );
}

/* ============================================================
   HERO
   ============================================================ */

function HeroSection({
  greeting,
  firstName,
  onUpload,
  onChat,
}: {
  greeting: string;
  firstName: string;
  onUpload: () => void;
  onChat: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-lg">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <div className="relative flex flex-col gap-8 p-8 md:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <Sparkles size={12} aria-hidden="true" />
            AI Document Assistant
          </span>

          <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {greeting}, {firstName}
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Manage documents, run semantic search, generate AI summaries, and
            chat with your knowledge base — all in one workspace.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={onUpload}
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 active:translate-y-0"
            >
              <Upload size={16} aria-hidden="true" />
              Upload Document
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>

            <button
              onClick={onChat}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-accent active:translate-y-0"
            >
              <Sparkles size={16} aria-hidden="true" />
              Open AI Chat
            </button>
          </div>
        </div>

        <div className="hidden shrink-0 lg:block">
          <div className="w-56 rounded-2xl border border-border/60 bg-background/40 p-6 backdrop-blur-xl">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Workspace
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold">Ready</h2>

            <div className="my-5 h-px bg-border" />

            <div className="flex justify-between text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="mt-1 flex items-center gap-1.5 font-semibold text-emerald-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Online
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">AI Engine</p>
                <p className="mt-1 font-semibold">Ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   STATS
   ============================================================ */

function StatsSection({ stats, isLoading }: { stats: StatItem[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ title, value, icon: Icon, accent, delta }) => {
        const styles = ACCENT_STYLES[accent];
        return (
          <div
            key={title}
            className="rounded-2xl border border-border/60 bg-surface px-6 py-6 transition-all hover:border-border-strong hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ${styles.icon} ${styles.ring}`}
              >
                <Icon size={16} aria-hidden="true" />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold leading-none text-foreground">
              {value}
            </p>

            {delta && (
              <p className="mt-2 text-xs font-medium text-muted-foreground">{delta}</p>
            )}
          </div>
        );
      })}
    </section>
  );
}

/* ============================================================
   RECENT DOCUMENTS
   ============================================================ */

function RecentDocumentsPanel({
  documents,
  isLoading,
  error,
  onRetry,
  onUpload,
  onViewAll,
}: {
  documents: RecentDocument[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onUpload: () => void;
  onViewAll: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface p-6 xl:col-span-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Recent Documents
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your recently uploaded files will appear here.
          </p>
        </div>
        {documents.length > 0 && (
          <button
            onClick={onViewAll}
            className="hidden rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-accent md:block"
          >
            View all
          </button>
        )}
      </div>

      <div className="mt-6">
        {error ? (
          <ErrorState onRetry={onRetry} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <DocumentRowSkeleton key={i} />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <EmptyDocumentsState onUpload={onUpload} />
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <button
                key={doc.id}
                className="flex w-full items-center gap-4 rounded-xl border border-border/50 bg-background/40 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText size={18} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {doc.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {doc.type} · {doc.sizeLabel}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={12} aria-hidden="true" />
                  {timeAgo(doc.updatedAt)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyDocumentsState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/40 px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
        <FileText size={28} className="text-primary" aria-hidden="true" />
      </div>

      <h3 className="mt-6 font-display text-xl font-bold text-foreground">
        Your library is empty
      </h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Upload your first PDF, Word, Excel or text document to unlock
        semantic search, AI summaries, and document chat.
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button
          onClick={onUpload}
          className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5"
        >
          <Upload size={16} aria-hidden="true" />
          Upload First Document
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="mt-10 grid w-full max-w-2xl gap-4 sm:grid-cols-3">
        {[
          { icon: Upload, label: "Upload", desc: "PDFs, DOCX, Excel, Markdown", color: "text-blue-400" },
          { icon: Search, label: "Search", desc: "Instant semantic answers", color: "text-amber-400" },
          { icon: Sparkles, label: "Chat", desc: "Ask questions naturally", color: "text-violet-400" },
        ].map(({ icon: Icon, label, desc, color }) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4">
            <Icon size={18} className={`mx-auto ${color}`} aria-hidden="true" />
            <h4 className="mt-3 text-sm font-semibold text-foreground">{label}</h4>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl border border-danger/30 bg-danger/5 px-6 py-14 text-center"
    >
      <h3 className="font-display text-lg font-bold text-foreground">
        Couldn't load your documents
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Something went wrong while fetching your library. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="mt-6 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold transition-all hover:bg-accent"
      >
        Retry
      </button>
    </div>
  );
}

/* ============================================================
   QUICK ACTIONS
   ============================================================ */

function QuickActionsPanel({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border/60 bg-surface p-6">
      <h2 className="font-display text-xl font-bold text-foreground">Quick Actions</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Jump into your most common workflows.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        {actions.map(({ title, subtitle, icon: Icon, onClick, accent }) => {
          const styles = ACCENT_STYLES[accent];
          return (
            <button
              key={title}
              onClick={onClick}
              className="group flex items-center gap-4 rounded-xl border border-border/60 bg-background/40 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${styles.icon} ${styles.ring}`}
              >
                <Icon size={18} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
              </div>
              <ArrowRight
                size={16}
                className="shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <Sparkles size={18} className="text-primary" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-foreground">AI Assistant</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Upload documents and start asking questions — your assistant can
              summarize, answer, and help you find information faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}