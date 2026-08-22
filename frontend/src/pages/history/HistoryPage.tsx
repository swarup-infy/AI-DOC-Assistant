import { useEffect, useMemo, useState } from "react";
import { Clock3, Loader2, MessageSquare, Search, Trash2 } from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { deleteChatHistory, getChatHistory, type ChatHistory } from "../../services/chatService";

export default function HistoryPage() {
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory() {
    try {
      setLoading(true);
      setError("");
      setHistory(await getChatHistory());
    } catch (err) {
      console.error(err);
      setError("We couldn't load your conversation history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return history;
    return history.filter((item) => item.question.toLowerCase().includes(keyword) || item.answer.toLowerCase().includes(keyword));
  }, [history, search]);

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this conversation permanently?")) return;
    try {
      await deleteChatHistory(id);
      setHistory((items) => items.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      setError("Unable to delete this conversation.");
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10 fade-in">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <Clock3 size={14} /> Conversation archive
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Chat History</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">Review previous AI conversations and quickly find an earlier answer.</p>
        </section>

        <section className="surface rounded-2xl p-4">
          <div className="relative">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations..." aria-label="Search conversation history" className="h-11 w-full rounded-xl border border-border bg-background/60 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10" />
          </div>
        </section>

        {error && <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <section className="surface overflow-hidden rounded-2xl">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-muted-foreground"><Loader2 size={19} className="animate-spin text-primary" />Loading history...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="px-6 py-16 text-center sm:py-20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><MessageSquare size={25} /></div>
              <h3 className="mt-5 text-base font-semibold text-foreground">{search ? "No conversations found" : "No chat history yet"}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{search ? "Try another search term." : "Start a conversation in AI Chat and your history will appear here."}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredHistory.map((item) => (
                <article key={item.id} className="group p-5 transition hover:bg-muted/25 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><MessageSquare size={17} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="min-w-0 flex-1 text-sm font-semibold text-foreground">{item.question}</h3>
                        <span className="rounded-md border border-border bg-muted px-2 py-1 text-[10px] font-semibold capitalize text-muted-foreground">{item.mode}</span>
                        <button type="button" onClick={() => void handleDelete(item.id)} aria-label="Delete conversation" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive"><Trash2 size={15} /></button>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
                      <div className="mt-4 rounded-xl border border-border bg-muted/35 p-4 text-sm leading-6 text-muted-foreground">{item.answer}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
