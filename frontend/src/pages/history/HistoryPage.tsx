import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileJson,
  FileSpreadsheet,
  Filter,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Settings2,
  Trash2,
  X,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import {
  clearChatHistory,
  deleteChatHistory,
  getChatHistory,
  type ChatHistory,
  type ChatMode,
} from "../../services/chatService";

type ModeFilter = "all" | ChatMode;
type DateFilter = "all" | "today" | "7d" | "30d";
type SortOrder = "newest" | "oldest";

const PAGE_SIZE = 10;
const HISTORY_SETTINGS_KEY = "chat_history_view_settings";

function readViewSettings(): { showAnswers: boolean; compactView: boolean } {
  try {
    const raw = localStorage.getItem(HISTORY_SETTINGS_KEY);
    if (!raw) return { showAnswers: true, compactView: false };
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return { showAnswers: true, compactView: false };
    }
    const settings = parsed as Record<string, unknown>;
    return {
      showAnswers: typeof settings.showAnswers === "boolean" ? settings.showAnswers : true,
      compactView: typeof settings.compactView === "boolean" ? settings.compactView : false,
    };
  } catch {
    return { showAnswers: true, compactView: false };
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value: unknown): string {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<ModeFilter>("all");
  const [dateRange, setDateRange] = useState<DateFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [showAnswers, setShowAnswers] = useState(() => readViewSettings().showAnswers);
  const [compactView, setCompactView] = useState(() => readViewSettings().compactView);
  const [showSettings, setShowSettings] = useState(false);
  const [page, setPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadHistory = useCallback(async (background = false) => {
    try {
      if (background) setRefreshing(true);
      else setLoading(true);
      setError("");
      const records = await getChatHistory(100);
      setHistory(records);
    } catch (err) {
      console.error("Unable to load chat history:", err);
      setError("We couldn't load your conversations. Check your connection and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const timer = window.setTimeout(() => setCurrentTime(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        HISTORY_SETTINGS_KEY,
        JSON.stringify({ showAnswers, compactView })
      );
    } catch (err) {
      console.warn("Unable to save chat history view settings:", err);
    }
  }, [showAnswers, compactView]);

  const filteredHistory = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();
    const now = currentTime;
    const rangeMs = dateRange === "today"
      ? 24 * 60 * 60 * 1000
      : dateRange === "7d"
        ? 7 * 24 * 60 * 60 * 1000
        : dateRange === "30d"
          ? 30 * 24 * 60 * 60 * 1000
          : null;

    return history
      .filter((item) => {
        const matchesSearch = !keyword
          || item.question.toLocaleLowerCase().includes(keyword)
          || item.answer.toLocaleLowerCase().includes(keyword);
        const matchesMode = mode === "all" || item.mode === mode;
        const timestamp = new Date(item.created_at).getTime();
        const matchesDate = rangeMs === null
          || (!Number.isNaN(timestamp) && now - timestamp <= rangeMs && timestamp <= now + 60_000);
        return matchesSearch && matchesMode && matchesDate;
      })
      .sort((a, b) => {
        const difference = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return sortOrder === "newest" ? -difference : difference;
      });
  }, [history, search, mode, dateRange, sortOrder, currentTime]);

  useEffect(() => {
    setPage(1);
  }, [search, mode, dateRange, sortOrder]);

  const pageCount = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const visibleHistory = filteredHistory.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = Boolean(search.trim()) || mode !== "all" || dateRange !== "all";

  function resetFilters() {
    setSearch("");
    setMode("all");
    setDateRange("all");
    setSortOrder("newest");
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this conversation permanently? This cannot be undone.")) return;
    try {
      setDeletingId(id);
      setError("");
      await deleteChatHistory(id);
      setHistory((items) => items.filter((item) => item.id !== id));
      setNotice("Conversation deleted.");
    } catch (err) {
      console.error("Unable to delete conversation:", err);
      setError("Unable to delete this conversation. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleClearAll() {
    if (!history.length) return;
    if (!window.confirm(`Permanently delete all ${history.length} conversations? This cannot be undone.`)) return;
    try {
      setClearing(true);
      setError("");
      const result = await clearChatHistory();
      setHistory([]);
      setPage(1);
      setNotice(`${result.deleted_records} conversation(s) deleted.`);
    } catch (err) {
      console.error("Unable to clear chat history:", err);
      setError("Unable to clear your history. Please try again.");
    } finally {
      setClearing(false);
    }
  }

  function exportJson() {
    downloadFile(
      "chat-history.json",
      JSON.stringify(filteredHistory, null, 2),
      "application/json;charset=utf-8"
    );
    setNotice("Filtered conversations exported as JSON.");
  }

  function exportCsv() {
    const rows = [
      ["Question", "Answer", "Mode", "Created at", "Document ID"],
      ...filteredHistory.map((item) => [
        item.question,
        item.answer,
        item.mode,
        item.created_at,
        item.document_id ?? "",
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    downloadFile("chat-history.csv", "\uFEFF" + csv, "text/csv;charset=utf-8");
    setNotice("Filtered conversations exported as CSV.");
  }

  return (
    <DashboardLayout>
      <div className="fade-in space-y-6 pb-10">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Clock3 size={14} /> Conversation archive
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Chat History</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Search, filter, export, and manage your previous AI conversations.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void loadHistory(true)} disabled={refreshing || loading} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50">
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
            <div className="relative">
              <button type="button" onClick={() => setShowSettings((value) => !value)} aria-expanded={showSettings} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground transition hover:bg-muted">
                <Settings2 size={15} /> View settings <ChevronDown size={14} />
              </button>
              {showSettings && (
                <div className="absolute right-0 z-20 mt-2 w-60 space-y-3 rounded-xl border border-border bg-card p-4 shadow-xl">
                  <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-foreground">
                    Show AI answers
                    <input type="checkbox" checked={showAnswers} onChange={(event) => setShowAnswers(event.target.checked)} className="h-4 w-4 accent-primary" />
                  </label>
                  <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-foreground">
                    Compact layout
                    <input type="checkbox" checked={compactView} onChange={(event) => setCompactView(event.target.checked)} className="h-4 w-4 accent-primary" />
                  </label>
                  <button type="button" onClick={() => setShowSettings(false)} className="w-full rounded-lg bg-muted px-3 py-2 text-xs font-semibold text-foreground">Done</button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="surface rounded-2xl p-4">
            <p className="text-xs text-muted-foreground">Saved conversations</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{history.length}</p>
          </div>
          <div className="surface rounded-2xl p-4">
            <p className="text-xs text-muted-foreground">Matching results</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{filteredHistory.length}</p>
          </div>
          <div className="surface col-span-2 rounded-2xl p-4 sm:col-span-1">
            <p className="text-xs text-muted-foreground">Current view</p>
            <p className="mt-1 text-sm font-semibold capitalize text-foreground">{mode === "all" ? "All chat modes" : mode}</p>
          </div>
        </section>

        <section className="surface space-y-4 rounded-2xl p-4">
          <div className="relative">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions and AI answers..." aria-label="Search conversation history" className="h-11 w-full rounded-xl border border-border bg-background/60 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10" />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted"><X size={15} /></button>}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1.5">
              <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Filter size={13} /> Chat mode</span>
              <select value={mode} onChange={(event) => setMode(event.target.value as ModeFilter)} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary/50">
                <option value="all">All modes</option>
                <option value="document">Document RAG</option>
                <option value="smart">Smart AI</option>
                <option value="groq">Direct AI</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Clock3 size={13} /> Date range</span>
              <select value={dateRange} onChange={(event) => setDateRange(event.target.value as DateFilter)} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary/50">
                <option value="all">Any time</option>
                <option value="today">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">{sortOrder === "newest" ? <ArrowDownWideNarrow size={13} /> : <ArrowUpWideNarrow size={13} />} Sort order</span>
              <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary/50">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={exportCsv} disabled={!filteredHistory.length} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-40"><FileSpreadsheet size={14} /> Export CSV</button>
              <button type="button" onClick={exportJson} disabled={!filteredHistory.length} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-40"><FileJson size={14} /> Export JSON</button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {hasFilters && <button type="button" onClick={resetFilters} className="text-xs font-semibold text-primary hover:underline">Reset filters</button>}
              <button type="button" onClick={() => void handleClearAll()} disabled={!history.length || clearing} className="inline-flex h-9 items-center gap-2 rounded-lg border border-destructive/20 px-3 text-xs font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-40">
                {clearing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Clear all
              </button>
            </div>
          </div>
        </section>

        {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"><span>{error}</span><button type="button" onClick={() => void loadHistory()} className="shrink-0 font-semibold underline">Retry</button></div>}
        {notice && <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"><span className="flex items-center gap-2"><Check size={15} />{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss message"><X size={14} /></button></div>}

        <section className="surface overflow-hidden rounded-2xl">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-muted-foreground"><Loader2 size={19} className="animate-spin text-primary" />Loading history...</div>
          ) : visibleHistory.length === 0 ? (
            <div className="px-6 py-16 text-center sm:py-20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><MessageSquare size={25} /></div>
              <h3 className="mt-5 text-base font-semibold text-foreground">{hasFilters ? "No matching conversations" : "No chat history yet"}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{hasFilters ? "Try changing your search or filters." : "Start a conversation in AI Chat and your saved history will appear here."}</p>
              {hasFilters && <button type="button" onClick={resetFilters} className="mt-4 text-sm font-semibold text-primary hover:underline">Clear filters</button>}
            </div>
          ) : (
            <>
              <div className="divide-y divide-border">
                {visibleHistory.map((item) => (
                  <article key={item.id} className={compactView ? "group p-4 transition hover:bg-muted/25" : "group p-5 transition hover:bg-muted/25 sm:p-6"}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><MessageSquare size={17} /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start gap-2">
                          <h3 className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-foreground">{item.question}</h3>
                          <span className="rounded-md border border-border bg-muted px-2 py-1 text-[10px] font-semibold capitalize text-muted-foreground">{item.mode}</span>
                          <button type="button" onClick={() => void handleDelete(item.id)} disabled={deletingId === item.id} aria-label="Delete conversation" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50">
                            {deletingId === item.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(item.created_at)}{item.document_id ? ` · Document #${item.document_id}` : ""}</p>
                        {showAnswers && <div className={compactView ? "mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground" : "mt-4 whitespace-pre-wrap break-words rounded-xl border border-border bg-muted/35 p-4 text-sm leading-6 text-muted-foreground"}>{item.answer}</div>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-6">
                <p className="text-xs text-muted-foreground">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredHistory.length)} of {filteredHistory.length}</p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} aria-label="Previous page" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-40"><ChevronLeft size={16} /></button>
                  <span className="min-w-16 text-center text-xs font-medium text-muted-foreground">Page {page} / {pageCount}</span>
                  <button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={page >= pageCount} aria-label="Next page" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-40"><ChevronRight size={16} /></button>
                </div>
              </div>
            </>
          )}
        </section>
        <p className="text-center text-xs text-muted-foreground">Your conversation history is private to your account. Exported files are saved locally to your device.</p>
      </div>
    </DashboardLayout>
  );
}
